import type { EnvironmentRule } from "@/shared/types";
import { RuleCard } from "./RuleCard";

interface RulesListProps {
  rules: EnvironmentRule[];
  onChange: (rules: EnvironmentRule[]) => void;
  onAdd: () => void;
}

export function RulesList({ rules, onChange, onAdd }: RulesListProps) {
  const updateAt = (index: number, rule: EnvironmentRule) => {
    const next = [...rules];
    next[index] = rule;
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rules.length) return;
    const next = [...rules];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Environment rules</h2>
        <button type="button" className="ghost" onClick={onAdd}>
          Add rule
        </button>
      </div>
      <p className="hint">
        Edit any existing rule’s textarea to add more hosts — one hostname per
        line, then click <strong>Save</strong>. Rules are checked top to bottom
        (first match wins). Patterns match the <strong>hostname</strong> and
        support <code>*</code> wildcards (e.g. <code>*.staging.example.com</code>
        , <code>localhost</code>).
      </p>
      <div className="rules">
        {rules.map((rule, index) => (
          <RuleCard
            key={rule.id}
            rule={rule}
            index={index}
            total={rules.length}
            onChange={(next) => updateAt(index, next)}
            onMoveUp={() => move(index, index - 1)}
            onMoveDown={() => move(index, index + 1)}
            onDelete={() => remove(index)}
          />
        ))}
      </div>
    </section>
  );
}
