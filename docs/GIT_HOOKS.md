# Git Hooks & Commit Guidelines

## Tổng quan

Dự án này sử dụng Husky để quản lý Git hooks và đảm bảo code quality trước khi commit.

## Cấu hình đã thiết lập:

### 1. **Pre-commit Hook**
- Tự động chạy `lint-staged` trước khi commit
- Chỉ lint và format các file đã staged
- Bỏ qua các file trong `.gitignore` và `.dockerignore`

### 2. **Commit-msg Hook**
- Kiểm tra format commit message với Commitlint
- Sử dụng Conventional Commits format

### 3. **Lint-staged Configuration**
- Chỉ xử lý các file đã staged
- Bỏ qua các file không cần thiết:
  - `node_modules/`
  - `dist/`, `build/`, `coverage/`
  - `uploads/`
  - Config files (`.config.js`, `Dockerfile`, etc.)
  - Log files, environment files

## Commit Message Format

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types được hỗ trợ:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

### Ví dụ:
```bash
feat: add user authentication
fix: resolve memory leak in note controller
docs: update API documentation
style: format code with prettier
refactor: simplify user service logic
test: add unit tests for auth middleware
chore: update dependencies
```

## Scripts có sẵn:

```bash
# Setup Husky hooks
npm run prepare

# Run lint-staged manually
npm run lint:staged

# Format và lint toàn bộ dự án
npm run format:lint
```

## Troubleshooting

### Lỗi Husky với Node.js version cũ:
Nếu gặp lỗi với Node.js version, script `setup-husky.js` sẽ tự động xử lý.

### Bỏ qua hooks tạm thời:
```bash
git commit --no-verify -m "feat: your message"
```

### Reset Husky hooks:
```bash
rm -rf .husky
npm run prepare
```

## Files được ignore:

### ESLint ignores:
- `node_modules/`, `dist/`, `build/`, `coverage/`
- `uploads/`, `*.config.js`, `Dockerfile`
- `docker-compose*.yml`, `Makefile`
- `.gitignore`, `.dockerignore`, `.editorconfig`
- Log files, environment files

### Lint-staged ignores:
- Tất cả files trong `.gitignore`
- Config files không cần lint
- Build artifacts

## Lưu ý:

1. **Chỉ staged files được xử lý**: Lint-staged chỉ chạy trên files đã được staged
2. **Auto-format**: Code sẽ được format tự động trước khi commit
3. **Commit message validation**: Commit message phải tuân theo format chuẩn
4. **Performance**: Chỉ xử lý files cần thiết, không lint toàn bộ dự án
