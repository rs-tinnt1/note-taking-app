# Development Guide

## Code Style & Formatting

Dự án này được cấu hình với syntax tối giản tương tự như Go và Python, với tự động format khi lưu.

### Cấu hình đã thiết lập:

1. **ESLint**: Cấu hình tối giản với rules như Go/Python
2. **Prettier**: Format code tự động với style tối giản
3. **VS Code**: Tự động format khi lưu
4. **EditorConfig**: Cấu hình editor nhất quán

### Scripts có sẵn:

```bash
# Format code với Prettier
npm run format

# Kiểm tra format
npm run format:check

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format + Lint (chạy cả hai)
npm run format:lint
```

### Style Guidelines:

#### 1. **Syntax tối giản (Go style)**
```javascript
// ✅ Tốt - Arrow functions, early returns
const getUser = (id) => {
  if (!id) return null
  return users.find(user => user.id === id)
}

// ❌ Tránh - Nested conditions
const getUser = (id) => {
  if (id) {
    return users.find(user => user.id === id)
  } else {
    return null
  }
}
```

#### 2. **Destructuring (Python-like unpacking)**
```javascript
// ✅ Tốt - Object destructuring
const { name, email } = user
const [first, ...rest] = items

// ❌ Tránh - Truy cập từng property
const name = user.name
const email = user.email
```

#### 3. **Template literals**
```javascript
// ✅ Tốt
const message = `Hello ${name}, welcome!`

// ❌ Tránh
const message = 'Hello ' + name + ', welcome!'
```

#### 4. **Const/Let (Go style)**
```javascript
// ✅ Tốt - Prefer const
const users = []
const config = { port: 3000 }

// ✅ OK - Use let when reassigning
let currentUser = null

// ❌ Tránh - var
var users = []
```

#### 5. **Line length (PEP8 style)**
- Tối đa 100 ký tự cho code thường
- Tối đa 120 ký tự cho test files

#### 6. **Naming**
- camelCase cho variables và functions
- PascalCase cho classes
- UPPER_CASE cho constants

### VS Code Extensions được khuyến nghị:

1. **Prettier - Code formatter** (`esbenp.prettier-vscode`)
2. **ESLint** (`dbaeumer.vscode-eslint`)
3. **EditorConfig for VS Code** (`editorconfig.editorconfig`)

### Tự động format khi lưu:

VS Code sẽ tự động:
- Format code với Prettier khi save
- Fix ESLint errors khi save
- Organize imports khi save

### Cấu hình files:

- `.prettierrc.js`: Cấu hình Prettier
- `eslint.config.js`: Cấu hình ESLint
- `.vscode/settings.json`: VS Code settings
- `.editorconfig`: Editor configuration

### Lưu ý:

- Không cần semicolons (Go style)
- Single quotes cho strings (Python style)
- No trailing commas (Go style)
- Arrow functions khi có thể
- Early returns thay vì nested conditions
