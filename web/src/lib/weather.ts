/**
 * Previsão do tempo para Paraty.
 *
 * A chave da OpenWeatherMap fica só aqui, no servidor — nunca vai para o
 * navegador. No app iOS ela estava em texto claro dentro do binário e commitada
 * num repositório público.
 */

const PARATY = { lat: -23.2178, lon: -44.7131 };
const REVALIDATE_SECONDS = 600;

export interface CurrentWeather {
  city: string;
  temp: number;
  feelsLike: number;
  min: number;
  max: number;
  humidity: number;
  description: string;
  icon: WeatherIcon;
}

export interface ForecastDay {
  dayKey: string;
  min: number;
  max: number;
  icon: WeatherIcon;
  description: string;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: string;
}

export type WeatherIcon = "sol" | "nuvem" | "chuva" | "tempestade" | "neve" | "neblina";

export class WeatherNotConfiguredError extends Error {
  constructor() {
    super("OPENWEATHER_API_KEY não configurada");
  }
}

export async function getWeather(): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new WeatherNotConfiguredError();

  const query = `lat=${PARATY.lat}&lon=${PARATY.lon}&appid=${apiKey}&units=metric&lang=pt_br`;
  const options = { next: { revalidate: REVALIDATE_SECONDS } };

  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?${query}`, options),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}`, options),
  ]);

  if (!currentResponse.ok || !forecastResponse.ok) {
    throw new Error("Não foi possível consultar a previsão do tempo agora.");
  }

  const current = (await currentResponse.json()) as OpenWeatherCurrent;
  const forecast = (await forecastResponse.json()) as OpenWeatherForecast;

  const byDay = groupByDay(forecast.list);
  const today = byDay[0];

  return {
    current: {
      city: current.name,
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      // A leitura "atual" da OpenWeather traz min/max quase iguais; a amplitude
      // real do dia vem da previsão de 3 em 3 horas.
      min: today?.min ?? current.main.temp_min,
      max: today?.max ?? current.main.temp_max,
      humidity: current.main.humidity,
      description: current.weather[0]?.description ?? "",
      icon: toIcon(current.weather[0]?.id ?? 800),
    },
    forecast: byDay.slice(0, 5),
    fetchedAt: new Date().toISOString(),
  };
}

function groupByDay(list: OpenWeatherForecast["list"]): ForecastDay[] {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const days = new Map<string, { temps: number[]; ids: number[]; descriptions: string[] }>();

  for (const entry of list) {
    const dayKey = formatter.format(new Date(entry.dt * 1000));
    const bucket = days.get(dayKey) ?? { temps: [], ids: [], descriptions: [] };

    bucket.temps.push(entry.main.temp_min, entry.main.temp_max);
    bucket.ids.push(entry.weather[0]?.id ?? 800);
    bucket.descriptions.push(entry.weather[0]?.description ?? "");
    days.set(dayKey, bucket);
  }

  return [...days.entries()].map(([dayKey, bucket]) => ({
    dayKey,
    min: Math.min(...bucket.temps),
    max: Math.max(...bucket.temps),
    // O pior tempo do dia é o que interessa para quem vai correr na serra.
    icon: toIcon(Math.min(...bucket.ids)),
    description: bucket.descriptions[Math.floor(bucket.descriptions.length / 2)] ?? "",
  }));
}

/** Códigos de condição da OpenWeatherMap agrupados em 6 ícones. */
function toIcon(id: number): WeatherIcon {
  if (id >= 200 && id < 300) return "tempestade";
  if (id >= 300 && id < 600) return "chuva";
  if (id >= 600 && id < 700) return "neve";
  if (id >= 700 && id < 800) return "neblina";
  if (id === 800) return "sol";
  return "nuvem";
}

interface OpenWeatherCondition {
  id: number;
  description: string;
}

interface OpenWeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
}

interface OpenWeatherCurrent {
  name: string;
  main: OpenWeatherMain;
  weather: OpenWeatherCondition[];
}

interface OpenWeatherForecast {
  list: { dt: number; main: OpenWeatherMain; weather: OpenWeatherCondition[] }[];
}
