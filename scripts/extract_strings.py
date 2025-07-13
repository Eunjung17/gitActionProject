import re
from pathlib import Path
from git import Repo

README = Path("README.md")
CODES_DIR = Path("codes")

# 문제 추출 정규표현식 (예: [547] [Number of Provinces])
problem_pattern = re.compile(r"\[(\d+)\]\s*\[?([^\]]+)\]?")

def readme_was_modified():
    repo = Repo(".")
    diff_files = repo.git.diff("HEAD~1", name_only=True).splitlines()
    return "README.md" in diff_files

def extract_problems():
    content = README.read_text(encoding="utf-8")
    if "Current Study Progress" not in content:
        print("❌ No study progress section found.")
        return

    # 표가 있는 부분만 추출
    table_section = content.split("## Current Study Progress")[-1]

    # 문제 추출
    matches = problem_pattern.findall(table_section)
    if not matches:
        print("❌ No problems found.")
        return

    # 하위 폴더들 순회
    user_dirs = [d for d in CODES_DIR.iterdir() if d.is_dir()]
    total_created = 0

    for user_dir in user_dirs:
        created = 0
        for num, title in matches:
            slug = f"{num}_{title.strip().replace(' ', '_')}.md"
            filepath = user_dir / slug
            if filepath.exists():
                continue

            content = f"# {title.strip()} (#{num})\n\nTODO: Add notes here."
            filepath.write_text(content, encoding="utf-8")
            print(f"✅ {user_dir.name}: {filepath.name}")
            created += 1
        total_created += created

    print(f"\n🎉 Total new files created: {total_created}")

if __name__ == "__main__":
    if readme_was_modified():
        print("✅ README.md was modified. Proceeding...")
        extract_problems()
    else:
        print("⏭ README.md not modified. Skipping extract.")
