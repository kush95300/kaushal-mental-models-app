import sys

def resolve_conflict(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    in_conflict = False
    in_head = False

    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_conflict = True
            in_head = True
            continue
        elif line.startswith('======='):
            in_head = False
            continue
        elif line.startswith('>>>>>>>'):
            in_conflict = False
            continue

        if in_conflict:
            if in_head:
                new_lines.append(line)
        else:
            new_lines.append(line)

    with open(file_path, 'w') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    resolve_conflict('src/app/eisenhower-matrix/page.tsx')
    resolve_conflict('src/lib/dateUtils.ts')
    resolve_conflict('src/types/eisenhower.ts')
