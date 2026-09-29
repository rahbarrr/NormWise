"""
NormWise Evaluation — Dataset Loader
=====================================
Loads and validates the JSONL evaluation dataset for the BGE reranker baseline.

Each line in the JSONL file represents one query with a list of candidates.
Each candidate has a relevance label:
    2 = highly relevant / directly applicable
    1 = partially relevant / related but not primary
    0 = not relevant
"""
import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger("normwise.evaluation.dataset")

# Default dataset path relative to this module
_DEFAULT_DATA_PATH = Path(__file__).parent / "data" / "queries.jsonl"

VALID_LABELS = {0, 1, 2}


@dataclass
class EvalCandidate:
    """A single candidate standard with relevance label."""
    candidate_id: str
    standard_number: str
    title: str
    description: Optional[str]
    label: int
    annotation_note: Optional[str] = None

    def __post_init__(self):
        if self.label not in VALID_LABELS:
            raise ValueError(
                f"Invalid label {self.label!r} for candidate '{self.candidate_id}'. "
                f"Expected one of {VALID_LABELS}."
            )


@dataclass
class EvalQuery:
    """A single evaluation query with its candidate pool."""
    query_id: str
    query: str
    category: str
    difficulty: str
    candidates: List[EvalCandidate] = field(default_factory=list)

    @property
    def has_relevant_candidates(self) -> bool:
        """True if any candidate has label >= 1."""
        return any(c.label >= 1 for c in self.candidates)

    @property
    def has_highly_relevant(self) -> bool:
        """True if any candidate has label == 2."""
        return any(c.label == 2 for c in self.candidates)


def load_dataset(path: Path = _DEFAULT_DATA_PATH) -> List[EvalQuery]:
    """
    Load evaluation queries from a JSONL file.

    Parameters
    ----------
    path : Path
        Path to the JSONL evaluation dataset.

    Returns
    -------
    List[EvalQuery]
        Parsed and validated list of evaluation queries.

    Raises
    ------
    FileNotFoundError
        If the dataset file does not exist.
    ValueError
        If any record has invalid structure or label values.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Evaluation dataset not found at: {path}")

    queries: List[EvalQuery] = []
    errors: List[str] = []

    with open(path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue

            try:
                record = json.loads(line)
            except json.JSONDecodeError as e:
                errors.append(f"Line {line_num}: JSON parse error — {e}")
                continue

            # Validate required top-level fields
            for required in ("query_id", "query", "category", "difficulty", "candidates"):
                if required not in record:
                    errors.append(
                        f"Line {line_num}: Missing required field '{required}' "
                        f"in record with query_id={record.get('query_id', '<unknown>')}"
                    )
                    continue

            try:
                candidates = [
                    EvalCandidate(
                        candidate_id=c["candidate_id"],
                        standard_number=c["standard_number"],
                        title=c["title"],
                        description=c.get("description"),
                        label=int(c["label"]),
                        annotation_note=c.get("annotation_note"),
                    )
                    for c in record["candidates"]
                ]
                queries.append(
                    EvalQuery(
                        query_id=record["query_id"],
                        query=record["query"],
                        category=record["category"],
                        difficulty=record["difficulty"],
                        candidates=candidates,
                    )
                )
            except (KeyError, ValueError, TypeError) as e:
                errors.append(
                    f"Line {line_num} (query_id={record.get('query_id', '<unknown>')}): {e}"
                )

    if errors:
        raise ValueError(
            f"Dataset loading failed with {len(errors)} error(s):\n"
            + "\n".join(f"  - {e}" for e in errors)
        )

    logger.info(
        f"Loaded evaluation dataset: {len(queries)} queries, "
        f"{sum(len(q.candidates) for q in queries)} candidate pairs."
    )
    return queries


def dataset_summary(queries: List[EvalQuery]) -> dict:
    """
    Compute summary statistics about the loaded dataset.

    Parameters
    ----------
    queries : List[EvalQuery]

    Returns
    -------
    dict
        Dictionary with summary statistics.
    """
    total_candidates = sum(len(q.candidates) for q in queries)
    categories = sorted({q.category for q in queries})
    difficulty_counts = {}
    for q in queries:
        difficulty_counts[q.difficulty] = difficulty_counts.get(q.difficulty, 0) + 1

    label_counts = {0: 0, 1: 0, 2: 0}
    for q in queries:
        for c in q.candidates:
            label_counts[c.label] = label_counts.get(c.label, 0) + 1

    no_relevant = [q.query_id for q in queries if not q.has_relevant_candidates]

    return {
        "num_queries": len(queries),
        "num_candidate_pairs": total_candidates,
        "avg_candidates_per_query": round(total_candidates / max(len(queries), 1), 2),
        "categories": categories,
        "num_categories": len(categories),
        "difficulty_distribution": difficulty_counts,
        "label_distribution": label_counts,
        "queries_with_no_relevant_candidates": no_relevant,
    }
