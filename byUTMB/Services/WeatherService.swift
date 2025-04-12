import Foundation

class WeatherService: ObservableObject {
    @Published var currentWeather: WeatherResponse?
    @Published var forecast: [DailyForecast]?
    @Published var todayMinMax: (min: Double, max: Double)?
    @Published var isLoading = false
    @Published var error: Error?
    
    private let apiKey = "1fad73bd8a7e836591a40ef538220e5a"
    private let lat = -23.2178 // Latitude de Paraty
    private let lon = -44.7131 // Longitude de Paraty
    
    func fetchWeather() {
        isLoading = true
        error = nil
        
        let currentURL = "https://api.openweathermap.org/data/2.5/weather?lat=\(lat)&lon=\(lon)&appid=\(apiKey)&units=metric&lang=pt_br"
        let forecastURL = "https://api.openweathermap.org/data/2.5/forecast?lat=\(lat)&lon=\(lon)&appid=\(apiKey)&units=metric&lang=pt_br"
        
        let group = DispatchGroup()
        
        group.enter()
        fetchCurrentWeather(url: currentURL) { [weak self] in
            group.leave()
        }
        
        group.enter()
        fetchForecast(url: forecastURL) { [weak self] in
            if let todayForecasts = self?.forecast?.filter({ 
                Calendar.current.isDate($0.date, inSameDayAs: Date())
            }) {
                let minTemp = todayForecasts.map { $0.main.temp_min }.min() ?? 0
                let maxTemp = todayForecasts.map { $0.main.temp_max }.max() ?? 0
                self?.todayMinMax = (min: minTemp, max: maxTemp)
            }
            group.leave()
        }
        
        group.notify(queue: .main) { [weak self] in
            self?.isLoading = false
        }
    }
    
    private func fetchCurrentWeather(url: String, completion: @escaping () -> Void) {
        guard let url = URL(string: url) else {
            error = URLError(.badURL)
            completion()
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self?.error = error
                    completion()
                    return
                }
                
                guard let data = data else {
                    self?.error = URLError(.badServerResponse)
                    completion()
                    return
                }
                
                do {
                    let decoder = JSONDecoder()
                    let response = try decoder.decode(WeatherResponse.self, from: data)
                    self?.currentWeather = response
                } catch {
                    print("Erro ao decodificar clima atual: \(error)")
                    if let dataString = String(data: data, encoding: .utf8) {
                        print("Resposta: \(dataString)")
                    }
                    self?.error = error
                }
                completion()
            }
        }.resume()
    }
    
    private func fetchForecast(url: String, completion: @escaping () -> Void) {
        guard let url = URL(string: url) else {
            error = URLError(.badURL)
            completion()
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self?.error = error
                    completion()
                    return
                }
                
                guard let data = data else {
                    self?.error = URLError(.badServerResponse)
                    completion()
                    return
                }
                
                do {
                    let decoder = JSONDecoder()
                    let response = try decoder.decode(ForecastResponse.self, from: data)
                    
                    // Filtra para pegar apenas uma previsão por dia
                    var seenDates = Set<String>()
                    let dailyForecasts = response.list.filter { forecast in
                        let dateString = forecast.date.formatted(date: .abbreviated, time: .omitted)
                        return seenDates.insert(dateString).inserted
                    }
                    
                    self?.forecast = Array(dailyForecasts.prefix(5))
                } catch {
                    print("Erro ao decodificar previsão: \(error)")
                    if let dataString = String(data: data, encoding: .utf8) {
                        print("Resposta: \(dataString)")
                    }
                    self?.error = error
                }
                completion()
            }
        }.resume()
    }
} 