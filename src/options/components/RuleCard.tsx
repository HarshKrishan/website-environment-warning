import { ENV_TYPES } from "@/shared/defaults";
import type { EnvironmentRule, EnvironmentType } from "@/shared/types";

interface RuleCardProps {
  rule: EnvironmentRule;
  index: number;
  total: number;
  onChange: (rule: EnvironmentRule) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function RuleCard({
  rule,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete
}: RuleCardProps) {
  return (
    <article className="rule-card">
      <div className="rule-top">
        <label className="field grow">
          <span>Name</span>
          <input
            type="text"
            value={rule.name}
            placeholder="Staging"
            onChange={(e) => onChange({ ...rule, name: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Environment</span>
          <select
            value={rule.environment}
            onChange={(e) =>
              onChange({
                ...rule,
                environment: e.target.value as EnvironmentType
              })
            }
          >
            {ENV_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Color</span>
          <input
            type="color"
            value={rule.color}
            onChange={(e) => onChange({ ...rule, color: e.target.value })}
          />
        </label>
        <label className="toggle compact">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(e) => onChange({ ...rule, enabled: e.target.checked })}
          />
          <span>On</span>
        </label>
      </div>

      <label className="field">
        <span>Hostname patterns (one per line)</span>
        <textarea
          rows={4}
          value={rule.patterns.join("\n")}
          placeholder={"localhost\n127.0.0.1\n*.local"}
          spellCheck={false}
          onChange={(e) =>
            onChange({
              ...rule,
              // Keep empty lines while typing so Enter can add another URL
              patterns: e.target.value.split("\n")
            })
          }
        />
      </label>

      <div className="rule-actions">
        <button
          type="button"
          className="ghost"
          disabled={index === 0}
          onClick={onMoveUp}
        >
          ↑
        </button>
        <button
          type="button"
          className="ghost"
          disabled={index >= total - 1}
          onClick={onMoveDown}
        >
          ↓
        </button>
        <button type="button" className="danger-text" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}
