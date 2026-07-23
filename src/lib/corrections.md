# Correction System

The correction system applies data-driven transformations to each converted Pokemon after initial parsing. It lives in `corrections.json` and is processed by `corrections.ts`.

This is useful because the RCT mod is in active development, and Pokemon names, regional forms, and other identifiers don't always map 1:1 from Showdown format. Rather than hardcoding edge cases in TypeScript, you declare them as JSON rules.

## How It Works

Each rule has two parts: `match` (when to apply) and `then` (what to change).

### Match Operators

| Operator | Example | Description |
|---|---|---|
| Exact string | `"species": "pikachu"` | Matches when the field equals the exact string |
| `$regex` | `"species": { "$regex": "^(\\w+)hisui$" }` | Matches with a JavaScript regex; capture groups are collected for use in `then` |

A rule only applies when **all** conditions in `match` are satisfied.

### Then Operators

| Operator | Example | Description |
|---|---|---|
| `$set` | `"species": { "$set": "$1" }` | Overwrite the field with the given value |
| `$append` | `"aspects": { "$append": "hisuian" }` | Append to an array field (creates array if absent) |
| `$prepend` | `"aspects": { "$prepend": "alolan" }` | Prepend to an array field (creates array if absent) |
| `$remove` | `"aspects": { "$remove": "mega" }` | Remove a value from an array field |

### Capture Group Substitution

Any string value in a `then` operation can reference regex capture groups with `$1`, `$2`, etc. These are substituted before the operation is applied.

## Example: Regional Forms

```json
{
  "pokemon": [
    {
      "match": {
        "species": { "$regex": "^(\\w+)hisui$" }
      },
      "then": {
        "species": { "$set": "$1" },
        "aspects": { "$append": "hisuian" }
      }
    }
  ]
}
```

Given a Pokemon with `species: "arcaninehisui"`:

1. The regex `^(\w+)hisui$` matches, capturing `"arcanine"` as `$1`
2. `$set: "$1"` changes species to `"arcanine"`
3. `$append: "hisuian"` adds `"hisuian"` to the `aspects` array

Result:
```json
{
  "species": "arcanine",
  "aspects": ["hisuian"]
}
```

## Adding New Rules

Edit `corrections.json`. No code changes needed. Rules are evaluated in order, so place more specific rules before broader ones if they could overlap.
