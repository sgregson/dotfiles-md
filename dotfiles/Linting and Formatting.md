# Linting and Formatting

## Prettier

## Eslint

## SCSS

```yaml $HOME/.stylelintrc action=symlink title=global-stylelint
# SCSS Linting rules, uses stylelint
#
# Rules are sorted alphabetcally,
#   comment out any unused rules so we don't have to go hunting later

defaultSeverity: warning
# plugins:
# - stylelint-scss
rules:
  selector-nested-pattern:
    - "^[^\\.][^A-Z].*$" # TODO ??
    - severity: error
```
