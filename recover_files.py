import json
import os
import glob
import codecs

files_to_recover = [
    "src/app/(dashboard)/dashboard/page.tsx",
    "src/app/(dashboard)/dashboard/profit/page.tsx",
    "src/app/(dashboard)/dashboard/quality/page.tsx",
    "src/app/(dashboard)/dashboard/franchise/page.tsx",
    "src/app/(dashboard)/dashboard/gl/invoices/page.tsx",
    "src/app/(dashboard)/dashboard/improvement/audits/page.tsx",
    "src/app/(dashboard)/dashboard/clients/page.tsx",
    "src/app/(dashboard)/dashboard/clients/contracts/page.tsx",
    "src/app/(dashboard)/dashboard/communications/meetings/page.tsx",
    "src/app/(dashboard)/dashboard/gl/assets/page.tsx"
]

logs = glob.glob("/home/barath07112004/.gemini/antigravity/brain/*/.system_generated/logs/overview.txt")

recovered = {}

for log in sorted(logs, key=os.path.getmtime):
    with open(log) as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get("source") == "MODEL":
                    for tc in data.get("tool_calls", []):
                        if tc["name"] == "write_to_file":
                            target = tc.get("args", {}).get("TargetFile", "").strip("\"'")
                            for target_file in files_to_recover:
                                if target.endswith(target_file):
                                    recovered[target_file] = tc["args"]["CodeContent"].strip("\"'")
            except Exception as e:
                pass

for k, v in recovered.items():
    print("Recovered", k, len(v))
    os.makedirs(os.path.dirname(k), exist_ok=True)
    with open(k, "w") as f:
        # The content in JSON might be literal backslash-n, decode it
        decoded = codecs.decode(v, "unicode_escape")
        f.write(decoded)

