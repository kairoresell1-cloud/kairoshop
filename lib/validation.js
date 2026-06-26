// Validazioni minime condivise — bloccano i casi più ovvi di input malevolo
// o errato (prezzi negativi, quantità assurde, stringhe vuote) prima che
// arrivino al database.

export function validatePrice(value, fieldName = "prezzo") {
  const n = parseFloat(value);
  if (Number.isNaN(n) || n < 0 || n > 1_000_000) {
    return `Il campo "${fieldName}" deve essere un numero valido tra 0 e 1.000.000.`;
  }
  return null;
}

export function validateQuantity(value, fieldName = "quantità") {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0 || n > 100_000 || !Number.isInteger(n)) {
    return `Il campo "${fieldName}" deve essere un numero intero tra 0 e 100.000.`;
  }
  return null;
}

export function validateRequiredString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return `Il campo "${fieldName}" è obbligatorio.`;
  }
  if (value.length > 5000) {
    return `Il campo "${fieldName}" è troppo lungo.`;
  }
  return null;
}

// Esegue una lista di controlli e ritorna il primo errore trovato, o null.
export function runValidations(checks) {
  for (const check of checks) {
    if (check) return check;
  }
  return null;
}
