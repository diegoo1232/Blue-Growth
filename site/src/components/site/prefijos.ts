import { getCountries, getCountryCallingCode, isValidPhoneNumber, validatePhoneNumberLength, type CountryCode } from "libphonenumber-js/min";

export type Pais = {
  iso: CountryCode;
  nombre: string;
  codigo: string; // prefijo sin "+", p. ej. "34"
  busqueda: string; // nombre sin tildes + prefijo + iso, para filtrar
};

const quitarTildes = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

let cache: Pais[] | null = null;

// Todos los países y territorios con prefijo telefónico, ordenados por nombre en español.
export function listaPaises(): Pais[] {
  if (cache) return cache;
  const nombres = new Intl.DisplayNames(["es"], { type: "region" });
  cache = getCountries()
    .map((iso) => {
      const nombre = nombres.of(iso) ?? iso;
      const codigo = getCountryCallingCode(iso);
      return { iso, nombre, codigo, busqueda: `${quitarTildes(nombre)} ${codigo} +${codigo} ${iso.toLowerCase()}` };
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return cache;
}

export function filtrarPaises(consulta: string): Pais[] {
  const q = quitarTildes(consulta.trim());
  const todos = listaPaises();
  return q ? todos.filter((p) => p.busqueda.includes(q)) : todos;
}

export function paisPorDefecto(): CountryCode {
  // país del idioma del navegador (es-MX → México); si no hay, España
  const region = typeof navigator !== "undefined" ? navigator.language.split("-")[1]?.toUpperCase() : undefined;
  const existe = region && listaPaises().some((p) => p.iso === region);
  return (existe ? region : "ES") as CountryCode;
}

export function numeroValido(numero: string, iso: CountryCode): boolean {
  return isValidPhoneNumber(numero, iso);
}

// Cuántos dígitos suelen tener los números de cada país (sin el prefijo). La biblioteca conoce los largos
// posibles por país; se sondean una vez y se guardan.
const largos = new Map<string, number[]>();
export function largosPosibles(iso: CountryCode): number[] {
  const guardado = largos.get(iso);
  if (guardado) return guardado;
  // Se prueba con varios dígitos iniciales (1 a 9) y se unen los resultados: con uno solo, algunos países
  // (Finlandia, Åland, Corea del Norte) rechazan la prueba y quedaban sin dato.
  const unicos = new Set<number>();
  for (let d = 1; d <= 9; d++) {
    for (let n = 3; n <= 15; n++) {
      if (validatePhoneNumberLength(String(d).repeat(n), iso) === undefined) unicos.add(n);
    }
  }
  const lista = [...unicos].sort((x, y) => x - y);
  largos.set(iso, lista);
  return lista;
}

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

// Aviso sobre el número escrito según el país elegido. `estricto` = también avisar de que faltan dígitos o
// de que el formato no es válido (al salir del campo o al enviar); mientras se escribe solo se avisa de que sobran.
export function avisoTelefono(numero: string, iso: CountryCode, estricto: boolean): string | undefined {
  const digitos = numero.replace(/\D/g, "").length;
  if (digitos === 0) return estricto ? "Escribe tu número de teléfono." : undefined;
  const pais = listaPaises().find((p) => p.iso === iso);
  const donde = pais ? `${pais.nombre} (+${pais.codigo})` : iso;
  const posibles = largosPosibles(iso);
  if (posibles.length === 0) return estricto && !numeroValido(numero, iso) ? `Ese número no es válido para ${donde}.` : undefined;
  const min = posibles[0];
  const max = posibles[posibles.length - 1];
  const habitual =
    min === max
      ? `${min} dígitos`
      : posibles.length <= 4
        ? `${posibles.slice(0, -1).join(", ")} u ${max} dígitos`
        : `entre ${min} y ${max} dígitos`;
  if (digitos > max) {
    return `Te sobra${digitos - max === 1 ? "" : "n"} ${plural(digitos - max, "dígito", "dígitos")}: en ${donde} los números tienen ${habitual}.`;
  }
  if (!estricto) return undefined;
  if (digitos < min) {
    return `Te falta${min - digitos === 1 ? "" : "n"} ${plural(min - digitos, "dígito", "dígitos")}: en ${donde} los números tienen ${habitual}.`;
  }
  if (!numeroValido(numero, iso)) return `Ese número no parece válido para ${donde}. Revisa que esté bien escrito.`;
  return undefined;
}
