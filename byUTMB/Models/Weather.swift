import Foundation

// Resposta da API para clima atual
struct WeatherResponse: Codable {
    let weather: [WeatherCondition]
    let main: MainWeather
    let name: String
}

// Resposta da API para previsão de 5 dias
struct ForecastResponse: Codable {
    let list: [DailyForecast]
    let city: City
}

struct City: Codable {
    let name: String
    let country: String
}

struct DailyForecast: Codable, Identifiable {
    let id = UUID()
    let dt: Int
    let main: MainWeather
    let weather: [WeatherCondition]
    let dt_txt: String
    
    var date: Date {
        Date(timeIntervalSince1970: TimeInterval(dt))
    }
}

struct WeatherCondition: Codable {
    let id: Int
    let main: String
    let description: String
    let icon: String
    
    var systemIcon: String {
        switch id {
        case 200...232: return "cloud.bolt.rain"
        case 300...321: return "cloud.drizzle"
        case 500...531: return "cloud.rain"
        case 600...622: return "cloud.snow"
        case 701...781: return "cloud.fog"
        case 800: return "sun.max"
        case 801...804: return "cloud"
        default: return "cloud"
        }
    }
}

struct MainWeather: Codable {
    let temp: Double
    let feels_like: Double
    let temp_min: Double
    let temp_max: Double
    let pressure: Int
    let humidity: Int
} 