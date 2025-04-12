import Foundation

class OnlineScheduleService: ObservableObject {
    @Published var events: [Event] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private let sheetURL = "https://docs.google.com/spreadsheets/d/1tsRN2gHLSVr59h3YCTWAXQuVXN8Kc2wqRENCtPTeR_0/export?format=csv"
    
    func fetchEvents() {
        isLoading = true
        error = nil
        
        print("🔄 Iniciando carregamento da planilha...")
        
        guard let url = URL(string: sheetURL) else {
            error = URLError(.badURL)
            isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("❌ Erro de rede: \(error.localizedDescription)")
                    self?.error = error
                    self?.isLoading = false
                    return
                }
                
                guard let data = data,
                      let csvString = String(data: data, encoding: .utf8) else {
                    print("❌ Erro ao decodificar dados")
                    self?.error = URLError(.badServerResponse)
                    self?.isLoading = false
                    return
                }
                
                print("📥 Dados recebidos, processando...")
                
                let rows = csvString.components(separatedBy: .newlines)
                var events: [Event] = []
                
                // Pula a primeira linha (cabeçalho)
                for (index, row) in rows.enumerated() where index > 0 && !row.isEmpty {
                    let columns = row.components(separatedBy: ",")
                    guard columns.count >= 8 else { continue }
                    
                    let dateFormatter = DateFormatter()
                    dateFormatter.dateFormat = "yyyy-MM-dd HH:mm"
                    dateFormatter.timeZone = TimeZone(identifier: "America/Sao_Paulo")
                    
                    if let date = dateFormatter.date(from: "\(columns[0]) \(columns[1])") {
                        let title = columns[2].trimmingCharacters(in: .whitespaces)
                        let type = columns[6].trimmingCharacters(in: .whitespaces)
                        
                        print("📅 Processando: \(title) - Tipo: \(type)")
                        
                        let event = Event(
                            id: UUID(),
                            title: title,
                            description: columns[3].trimmingCharacters(in: .whitespaces),
                            date: date,
                            location: columns[4].trimmingCharacters(in: .whitespaces),
                            duration: TimeInterval(Int(columns[5]) ?? 3600),
                            type: self?.getEventType(from: type) ?? .entretenimento,
                            imageName: columns[7].trimmingCharacters(in: .whitespaces)
                        )
                        events.append(event)
                    }
                }
                
                print("✅ Total de eventos carregados: \(events.count)")
                self?.events = events
                self?.isLoading = false
            }
        }.resume()
    }
    
    private func getEventType(from string: String) -> EventType {
        let cleanString = string.trimmingCharacters(in: .whitespaces).lowercased()
        print("🏷️ Convertendo tipo: '\(cleanString)'")
        
        switch cleanString {
        case "esporte":
            return .esporte
        case "ativacao", "ativação":
            return .ativacao
        default:
            return .entretenimento
        }
    }
} 