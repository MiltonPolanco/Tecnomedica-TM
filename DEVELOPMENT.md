# GUÍA DE DESARROLLO - TECNOMEDICA

## 📚 Guía de Buenas Prácticas

### 🏗️ Arquitectura del Proyecto

#### Estructura de carpetas
- `src/app` - Páginas y componentes de Next.js App Router
- `src/libs` - Utilidades y configuraciones (DB, validaciones)
- `src/models` - Modelos de Mongoose
- `src/utils` - Funciones auxiliares reutilizables
- `src/constants` - Constantes y configuraciones

### 🔐 Seguridad

1. **Nunca** subas el archivo `.env` al repositorio
2. **Siempre** valida datos en el servidor, no confíes solo en validación del cliente
3. **Usa** el método `comparePassword` del modelo User para verificar contraseñas
4. **Sanitiza** entradas de usuario con las funciones de `apiHelpers.js`
5. **Implementa** rate limiting en producción (considerar next-rate-limit)

### 📝 Convenciones de Código

#### Nombres de archivos
- Componentes: `PascalCase.js` (ej: `UserProfile.js`)
- Utilidades: `camelCase.js` (ej: `apiHelpers.js`)
- Páginas: `page.js` (Next.js App Router)
- API Routes: `route.js`

#### Nombres de variables
- Variables y funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Componentes React: `PascalCase`
- Clases: `PascalCase`

#### Comentarios
```javascript
// ✅ BIEN: Comentarios que explican el "por qué"
// Usamos caché global para evitar múltiples conexiones en desarrollo
let cached = global.mongoose;

// ❌ MAL: Comentarios que repiten el código
// Establece cached a global.mongoose
let cached = global.mongoose;
```

### 🚀 Flujo de trabajo con Git

#### Branches
- `main` - Producción (siempre estable)
- `develop` - Desarrollo activo
- `feature/nombre` - Nuevas características
- `fix/nombre` - Corrección de bugs
- `hotfix/nombre` - Fixes urgentes para producción

#### Commits
Usar convenciones de Conventional Commits:
```
feat: Agregar calendario de citas
fix: Corregir validación de email
docs: Actualizar README
style: Formatear código
refactor: Mejorar conexión a BD
test: Agregar tests de usuario
chore: Actualizar dependencias
```

### 🗄️ Base de Datos

#### Modelos de Mongoose
- Define índices para campos que usarás en queries frecuentes
- Usa validación del esquema antes de confiar en validación manual
- Implementa métodos del modelo para lógica relacionada con ese modelo
- Usa `timestamps: true` para createdAt y updatedAt automáticos

```javascript
// ✅ Buena práctica
UserSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    email: this.email,
    role: this.role
  };
};

// Usar en rutas
const user = await User.findById(id);
return NextResponse.json(user.toPublicJSON());
```

#### Conexión
- Usa siempre `dbConnect()` de `libs/dbConnect.js`
- No crees múltiples conexiones
- Confía en el caché de conexión en desarrollo

### 🎨 Frontend

#### Componentes React
- Un componente = un archivo
- Usa componentes funcionales con hooks
- Extrae lógica compleja a custom hooks
- Props: desestructura en la firma de la función

```javascript
// ✅ Buena práctica
export default function UserCard({ name, email, role }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      <span>{role}</span>
    </div>
  );
}
```

#### Estado
- `useState` para estado local del componente
- Context API (AppContext) para estado global
- Próximo paso: considerar Zustand o Redux para estado complejo

#### Tailwind CSS
- Usa las clases de utilidad
- Define colores custom en `tailwind.config.js`
- Para estilos complejos repetidos, crea componentes

### 🔌 API Routes

#### Estructura estándar
```javascript
import { NextResponse } from 'next/server';
import dbConnect from '@/libs/dbConnect';
import { validateRequiredFields } from '@/utils/apiHelpers';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // 1. Validar datos
    validateRequiredFields(body, ['campo1', 'campo2']);
    
    // 2. Conectar a BD
    await dbConnect();
    
    // 3. Lógica de negocio
    const result = await Model.create(body);
    
    // 4. Respuesta exitosa
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
```

### 🧪 Testing (Próximos pasos)

Considera agregar:
- Jest para tests unitarios
- React Testing Library para componentes
- Playwright o Cypress para tests E2E

### 📦 Dependencias

#### Actualizar dependencias
```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar (con cuidado)
npm update

# Para major versions
npm install package@latest
```

#### Auditoría de seguridad
```bash
npm audit
npm audit fix
```

### 🚢 Deployment

#### Checklist pre-deploy
- [ ] Todas las variables de entorno configuradas
- [ ] `npm run build` funciona sin errores
- [ ] Tests pasan (cuando se implementen)
- [ ] No hay console.logs innecesarios
- [ ] .env no está en el repositorio
- [ ] README actualizado

#### Variables de entorno en Vercel
1. Project Settings → Environment Variables
2. Agregar todas las variables de `.env.example`
3. Redeploy después de cambiar variables

### 🐛 Debugging

#### Tips
- Usa `console.log` estratégicamente (luego remuévelos)
- Lee los stack traces completos
- Usa React DevTools y Network tab
- Verifica logs de Vercel en producción

#### Errores comunes
1. **"Connection refused"** → MongoDB no está corriendo o URL incorrecta
2. **"Module not found"** → Revisa rutas de import y aliases en jsconfig
3. **"Hydration error"** → Contenido del servidor vs cliente difiere
4. **"Cannot read property of undefined"** → Añade optional chaining `?.`

### 📈 Próximas mejoras sugeridas

1. **Sistema de citas completo**
   - Modelo de Appointment
   - Integración con Zoom/Meet para videollamadas
   - Sistema de notificaciones

2. **Dashboard**
   - Panel para doctores
   - Panel para pacientes
   - Analytics para admin

3. **Mejoras de seguridad**
   - Rate limiting
   - CSRF protection
   - Verificación de email

4. **Testing**
   - Tests unitarios
   - Tests de integración
   - Tests E2E

5. **Performance**
   - Image optimization
   - Lazy loading
   - Code splitting

6. **Features adicionales**
   - Chat en tiempo real
   - Historial médico
   - Recetas electrónicas
   - Pagos integrados

### 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Best Practices](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Best Practices](https://react.dev/learn)

---

**Nota**: Este documento es vivo. Actualízalo cuando implementes nuevas prácticas o patrones en el proyecto.
