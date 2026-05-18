# Dreamize Design System - Spacing

This directory contains the standardized spacing system for the Dreamize application, ensuring consistent visual rhythm and maintainable styles across all components.

## Overview

The spacing system is built on a 4px base unit (0.25rem) with a harmonious scale that follows design system best practices. All spacing values are defined as rem units for accessibility and scalability.

## Files

- `spacing.ts` - Core spacing tokens and semantic mappings
- `index.ts` - Design system entry point with utilities
- `README.md` - This documentation file

## Spacing Tokens

### Base Scale

```typescript
const spacingTokens = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '5rem',    // 80px
  '5xl': '6rem',    // 96px
}
```

### Semantic Mappings

The system provides semantic spacing for common use cases:

```typescript
const semanticSpacing = {
  // Form spacing
  formElementGap: '1rem',      // 16px between form elements
  formSectionGap: '2rem',      // 32px between form sections
  formLabelGap: '0.5rem',      // 8px between label and input
  
  // Layout spacing
  sectionGap: '2rem',          // 32px between major sections
  containerPadding: '3rem',    // 48px for main containers
  cardPadding: '2rem',         // 32px inside cards
  
  // Component spacing
  buttonPadding: '1rem',       // 16px button padding
  buttonGap: '0.5rem',         // 8px between buttons
  iconGap: '0.5rem',           // 8px between icon and text
}
```

## Usage

### Import the System

```typescript
import { 
  spacingTokens, 
  semanticSpacing, 
  getSpacing, 
  spacingClasses 
} from '@/lib/design-system';
```

### Using Spacing Tokens

```typescript
// Get a spacing value
const padding = getSpacing('xl'); // '2rem'

// Use semantic spacing
const formGap = semanticSpacing.formElementGap; // '1rem'
```

### Using CSS Variables

The spacing system automatically generates CSS variables:

```css
/* Available CSS variables */
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  
  /* Semantic variables */
  --spacing-form-element-gap: var(--spacing-md);
  --spacing-section-gap: var(--spacing-xl);
  --spacing-container-padding: var(--spacing-2xl);
}
```

### Using Tailwind Classes

The system extends Tailwind with standardized spacing:

```jsx
// Form components
<div className="max-w-md mx-auto w-full space-y-4">
  <div className="space-y-8">
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email
      </label>
      <input className="w-full px-4 py-3 border rounded-lg" />
    </div>
  </div>
</div>

// Layout components
<div className="space-y-8">
  <section className="p-8">
    <div className="space-y-4">
      <h2 className="mb-6">Section Title</h2>
      <p>Content with consistent spacing</p>
    </div>
  </section>
</div>
```

### Using Predefined Classes

```jsx
import { spacingClasses } from '@/lib/design-system';

// Form container
<div className={spacingClasses.formContainer}>
  <form className={spacingClasses.formSection}>
    <div className={spacingClasses.formElement}>
      <label className={spacingClasses.formLabel}>Label</label>
      <input className={spacingClasses.formInput} />
    </div>
  </form>
</div>

// Card component
<div className={spacingClasses.cardContainer}>
  <h3 className={spacingClasses.headingSpacing}>Card Title</h3>
  <div className={spacingClasses.paragraphSpacing}>
    <p>Card content with consistent spacing</p>
  </div>
</div>
```

## Migration Guide

### Converting Existing Components

1. **Identify Custom Spacing**: Look for hardcoded spacing values
2. **Map to Tokens**: Use the conversion utilities
3. **Apply Semantic Spacing**: Use semantic mappings where appropriate
4. **Validate**: Ensure spacing follows design system patterns

```typescript
import { migrationHelpers } from '@/lib/design-system';

// Convert existing spacing
const oldSpacing = 'p-3 mb-4';
const newSpacing = migrationHelpers.convertSpacing(oldSpacing);

// Validate spacing
const isValid = migrationHelpers.validateSpacing('space-y-4'); // true

// Get recommendations
const recommended = migrationHelpers.getRecommendedSpacing('form-element-gap');
// Returns: 'space-y-4'
```

### Common Patterns

#### Before (Custom Spacing)
```jsx
<div style={{ padding: '20px', marginBottom: '16px' }}>
  <div style={{ marginBottom: '12px' }}>
    <label style={{ marginBottom: '6px' }}>Label</label>
    <input style={{ padding: '12px 16px' }} />
  </div>
</div>
```

#### After (Standardized Spacing)
```jsx
<div className="p-6 mb-4">
  <div className="mb-3">
    <label className="mb-2">Label</label>
    <input className="px-4 py-3" />
  </div>
</div>
```

## Design System Compliance

### Rules

1. **Only use approved spacing tokens** - No custom spacing values
2. **Use semantic spacing** - Prefer semantic mappings over raw tokens
3. **Follow patterns** - Use established spacing patterns for consistency
4. **Validate spacing** - Use validation utilities to ensure compliance

### Validation

```typescript
// Check if spacing follows design system
const isValidSpacing = isValidSpacingToken('1rem'); // true
const isInvalidSpacing = isValidSpacingToken('1.2rem'); // false

// Convert pixels to tokens (for migration)
const token = pxToSpacingToken(16); // 'md'
const noToken = pxToSpacingToken(18); // null (not a standard token)
```

## Best Practices

1. **Use semantic spacing first** - Prefer `formElementGap` over raw tokens
2. **Be consistent** - Use the same spacing for similar elements
3. **Follow the scale** - Don't create custom spacing between tokens
4. **Consider context** - Use appropriate spacing for the component's purpose
5. **Test responsively** - Ensure spacing works across all screen sizes

## Integration with Existing Design Rules

This spacing system integrates with the existing design system rules:

- **Form Spacing**: `space-y-4` between form elements (16px)
- **Container Padding**: `p-8` for main containers (32px) 
- **Section Margins**: `mb-8` for major sections (32px)
- **Label Margins**: `mb-2` for labels (8px)
- **Input Padding**: `px-4 py-3` for inputs (16px horizontal, 12px vertical)

All existing patterns are maintained while providing a systematic foundation for future development.