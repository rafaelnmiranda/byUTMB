import SwiftUI

struct WeatherView: View {
    @StateObject private var service = WeatherService()
    @State private var showingForecast = false
    @State private var lastUpdate = Date()
    
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "pt_BR")
        formatter.dateFormat = "dd/MM/yyyy 'às' HH:mm"
        return formatter
    }()
    
    var body: some View {
        NavigationView {
            ZStack {
                if service.isLoading {
                    ProgressView("Carregando previsão...")
                } else if let error = service.error {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)
                        Text("Erro ao carregar previsão")
                            .font(.headline)
                        Text(error.localizedDescription)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        Button("Tentar novamente") {
                            service.fetchWeather()
                        }
                        .buttonStyle(.bordered)
                        .tint(byUTMBApp.utmbBlue)
                    }
                } else if let weather = service.currentWeather {
                    ScrollView {
                        VStack(spacing: 20) {
                            // Cidade
                            Text(weather.name)
                                .font(.title)
                                .fontWeight(.bold)
                            
                            // Clima atual
                            HStack(spacing: 20) {
                                Image(systemName: weather.weather.first?.systemIcon ?? "cloud")
                                    .font(.system(size: 60))
                                    .foregroundColor(byUTMBApp.utmbBlue)
                                
                                VStack(alignment: .leading) {
                                    Text(String(format: "%.1f°C", weather.main.temp))
                                        .font(.system(size: 40))
                                    Text(weather.weather.first?.description.capitalized ?? "")
                                        .font(.title3)
                                        .foregroundColor(.gray)
                                }
                            }
                            
                            // Temperaturas
                            HStack(spacing: 40) {
                                WeatherInfoItem(
                                    title: "Mínima", 
                                    value: String(format: "%.1f°C", service.todayMinMax?.min ?? weather.main.temp_min)
                                )
                                WeatherInfoItem(
                                    title: "Máxima", 
                                    value: String(format: "%.1f°C", service.todayMinMax?.max ?? weather.main.temp_max)
                                )
                            }
                            
                            // Sensação e umidade
                            HStack(spacing: 40) {
                                WeatherInfoItem(title: "Sensação", value: String(format: "%.1f°C", weather.main.feels_like))
                                WeatherInfoItem(title: "Umidade", value: "\(weather.main.humidity)%")
                            }
                            
                            // Previsão dos próximos dias
                            if let forecast = service.forecast {
                                Button {
                                    withAnimation {
                                        showingForecast.toggle()
                                    }
                                } label: {
                                    HStack {
                                        Text("Próximos dias")
                                        Image(systemName: showingForecast ? "chevron.up" : "chevron.down")
                                    }
                                    .frame(maxWidth: .infinity)
                                }
                                .buttonStyle(.bordered)
                                .tint(byUTMBApp.utmbBlue)
                                .padding(.top)
                                
                                if showingForecast {
                                    VStack(spacing: 12) {
                                        ForEach(forecast) { day in
                                            ForecastRow(forecast: day)
                                                .transition(.opacity)
                                        }
                                    }
                                    .padding(.top)
                                }
                            }
                            
                            Divider()
                                .padding(.top, 8)
                            
                            // Data e hora da última atualização
                            Text("Atualizado em \(dateFormatter.string(from: lastUpdate))")
                                .font(.caption2)
                                .foregroundColor(.gray.opacity(0.8))
                                .frame(maxWidth: .infinity, alignment: .center)
                                .padding(.bottom, 8)
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Previsão do Tempo")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    LogoView()
                }
            }
        }
        .onAppear {
            updateWeather()
        }
        .refreshable {
            updateWeather()
        }
    }
    
    private func updateWeather() {
        service.fetchWeather()
        lastUpdate = Date()
    }
}

struct WeatherInfoItem: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
            Text(value)
                .font(.title3)
                .fontWeight(.medium)
        }
    }
}

struct ForecastRow: View {
    let forecast: DailyForecast
    
    var body: some View {
        HStack {
            // Dia da semana
            Text(forecast.date.formatted(.dateTime.weekday(.wide)))
                .frame(width: 100, alignment: .leading)
            
            // Ícone do clima
            Image(systemName: forecast.weather.first?.systemIcon ?? "cloud")
                .foregroundColor(byUTMBApp.utmbBlue)
            
            Spacer()
            
            // Temperaturas
            HStack(spacing: 16) {
                Text(String(format: "%.0f°", forecast.main.temp_min))
                    .foregroundColor(.gray)
                Text(String(format: "%.0f°", forecast.main.temp_max))
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    WeatherView()
} 