"""
Causal DAG Generator — Uses DoWhy to generate a causal graph visualization.
Saves a static PNG to static/causal_dag.png for the UI.

Usage:
    cd backend && python generate_causal_dag.py
"""

import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt


# Build the Causal DAG manually (for demo purposes)
# In production, you'd use DoWhy's CausalModel to infer this.


STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)

print("Generating Causal DAG visualization...")

# Create a manual DAG visualization using matplotlib
fig, ax = plt.subplots(1, 1, figsize=(12, 8))
fig.patch.set_facecolor("#0f172a")
ax.set_facecolor("#0f172a")

# Node positions
nodes = {
    "Age": (0.2, 0.8),
    "Education": (0.5, 0.9),
    "Sex\n(Sensitive)": (0.1, 0.5),
    "Race\n(Sensitive)": (0.1, 0.2),
    "Occupation": (0.5, 0.6),
    "Hours/Week": (0.5, 0.3),
    "Marital\nStatus": (0.3, 0.5),
    "Income\n(Outcome)": (0.85, 0.5),
}

# Edges (cause -> effect)
edges = [
    ("Age", "Education"),
    ("Age", "Occupation"),
    ("Age", "Income\n(Outcome)"),
    ("Education", "Occupation"),
    ("Education", "Income\n(Outcome)"),
    ("Sex\n(Sensitive)", "Occupation"),
    ("Sex\n(Sensitive)", "Hours/Week"),
    ("Sex\n(Sensitive)", "Income\n(Outcome)"),
    ("Race\n(Sensitive)", "Education"),
    ("Race\n(Sensitive)", "Occupation"),
    ("Race\n(Sensitive)", "Income\n(Outcome)"),
    ("Occupation", "Income\n(Outcome)"),
    ("Hours/Week", "Income\n(Outcome)"),
    ("Marital\nStatus", "Income\n(Outcome)"),
    ("Marital\nStatus", "Hours/Week"),
]

# Draw edges
for src, dst in edges:
    x1, y1 = nodes[src]
    x2, y2 = nodes[dst]
    # Color sensitive paths red
    is_sensitive = "Sensitive" in src
    color = "#ef4444" if is_sensitive else "#64748b"
    lw = 2.5 if is_sensitive else 1.5
    alpha = 0.9 if is_sensitive else 0.5
    ax.annotate(
        "",
        xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(
            arrowstyle="->",
            color=color,
            lw=lw,
            alpha=alpha,
            connectionstyle="arc3,rad=0.1",
        ),
    )

# Draw nodes
for name, (x, y) in nodes.items():
    if "Sensitive" in name:
        color = "#ef4444"
        edge_color = "#fca5a5"
    elif "Outcome" in name:
        color = "#3b82f6"
        edge_color = "#93c5fd"
    else:
        color = "#1e293b"
        edge_color = "#64748b"

    bbox = dict(
        boxstyle="round,pad=0.5",
        facecolor=color,
        edgecolor=edge_color,
        linewidth=2,
        alpha=0.9,
    )
    ax.text(
        x, y, name,
        ha="center", va="center",
        fontsize=11, fontweight="bold",
        color="white",
        bbox=bbox,
    )

# Legend
legend_items = [
    ("Sensitive Attribute Path", "#ef4444"),
    ("Normal Causal Path", "#64748b"),
    ("Outcome Variable", "#3b82f6"),
]
for i, (label, color) in enumerate(legend_items):
    ax.plot([], [], color=color, linewidth=3, label=label)
ax.legend(
    loc="lower center",
    ncol=3,
    fontsize=10,
    facecolor="#1e293b",
    edgecolor="#334155",
    labelcolor="white",
    framealpha=0.9,
)

ax.set_xlim(-0.05, 1.05)
ax.set_ylim(0.0, 1.05)
ax.axis("off")
ax.set_title(
    "Causal DAG — Adult Census Income Prediction",
    fontsize=16, fontweight="bold", color="white", pad=20,
)

plt.tight_layout()
output_path = STATIC_DIR / "causal_dag.png"
fig.savefig(output_path, dpi=150, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()

print(f"✓ Causal DAG saved to {output_path}")
