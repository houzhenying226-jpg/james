#!/usr/bin/env python3
"""
Organize files in a target directory by file type.
"""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path


CATEGORY_MAP = {
    "Images": {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp", ".heic"},
    "Documents": {
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".txt",
        ".md",
        ".rtf",
        ".csv",
    },
    "Videos": {".mp4", ".mov", ".mkv", ".avi", ".flv", ".wmv", ".m4v"},
    "Audio": {".mp3", ".wav", ".aac", ".flac", ".ogg", ".m4a"},
    "Archives": {".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"},
    "Code": {
        ".py",
        ".js",
        ".ts",
        ".html",
        ".css",
        ".json",
        ".yml",
        ".yaml",
        ".xml",
        ".sh",
        ".bat",
        ".go",
        ".rs",
    },
    "Executables": {".exe", ".msi", ".dmg", ".pkg", ".app"},
}


def build_extension_index() -> dict[str, str]:
    index: dict[str, str] = {}
    for category, extensions in CATEGORY_MAP.items():
        for ext in extensions:
            index[ext] = category
    return index


def resolve_destination(base: Path, category: str, filename: str) -> Path:
    destination_dir = base / category
    destination_dir.mkdir(exist_ok=True)
    destination = destination_dir / filename
    if not destination.exists():
        return destination

    stem = destination.stem
    suffix = destination.suffix
    counter = 1
    while True:
        candidate = destination_dir / f"{stem}-{counter}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def should_skip(path: Path, include_hidden: bool) -> bool:
    if path.is_dir():
        return True
    if not include_hidden and path.name.startswith("."):
        return True
    return False


def organize(target: Path, dry_run: bool, include_hidden: bool) -> list[str]:
    extension_index = build_extension_index()
    actions: list[str] = []

    for item in target.iterdir():
        if should_skip(item, include_hidden):
            continue

        category = extension_index.get(item.suffix.lower(), "Others")
        destination = resolve_destination(target, category, item.name)
        actions.append(f"{item.name} -> {destination.relative_to(target)}")

        if not dry_run:
            shutil.move(str(item), str(destination))

    return actions


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Organize files in a directory by file type.",
    )
    parser.add_argument(
        "path",
        type=Path,
        nargs="?",
        default=Path.home() / "Desktop",
        help="Directory to organize (default: ~/Desktop)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show planned moves without changing files",
    )
    parser.add_argument(
        "--include-hidden",
        action="store_true",
        help="Include hidden files",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    target = args.path.expanduser().resolve()

    if not target.exists():
        raise SystemExit(f"Target directory does not exist: {target}")
    if not target.is_dir():
        raise SystemExit(f"Target path is not a directory: {target}")

    actions = organize(target, args.dry_run, args.include_hidden)
    if not actions:
        print("No files to organize.")
        return

    if args.dry_run:
        print("Dry run - no files moved.")

    for action in actions:
        print(action)


if __name__ == "__main__":
    main()
