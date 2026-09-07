"""PlanetAI ingest CLI.

    uv run planetai-ingest seed
    uv run planetai-ingest collect [--kinds rss,arxiv]
    uv run planetai-ingest trends
    uv run planetai-ingest scheduler
"""

from __future__ import annotations

import argparse
import logging
import sys


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s"
    )
    parser = argparse.ArgumentParser(prog="planetai-ingest")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("seed", help="upsert seed data into the database")

    p_collect = sub.add_parser("collect", help="run collectors once")
    p_collect.add_argument("--kinds", help="comma list: rss,arxiv,youtube,html_blog")

    sub.add_parser("trends", help="compute trend snapshots + refresh top signals")
    sub.add_parser("scheduler", help="run the long-lived scheduler")

    args = parser.parse_args(argv)

    if args.cmd == "seed":
        from planetai_ingest.seed import run

        run()
        return 0

    if args.cmd == "collect":
        from planetai_ingest.seed import run as seed_run
        from planetai_ingest.pipeline.ingest import run_all

        seed_run()
        kinds = set(args.kinds.split(",")) if args.kinds else None
        totals = run_all(only_kinds=kinds)
        print(totals)
        return 0

    if args.cmd == "trends":
        from planetai_ingest.pipeline.trends import compute_snapshots, refresh_top_signals

        compute_snapshots()
        n = refresh_top_signals()
        print(f"top signals: {n}")
        return 0

    if args.cmd == "scheduler":
        from planetai_ingest.scheduler import run_scheduler

        run_scheduler()
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
