import Foundation

class QuoteService: ObservableObject {
    @Published var quote: Quote?
    @Published var isLoading = false
    @Published var error: Error?
    @Published var translatedQuote: String?
    
    func fetchQuote() {
        isLoading = true
        error = nil
        
        let urlString = "https://zenquotes.io/api/today"
        
        guard let url = URL(string: urlString) else {
            error = URLError(.badURL)
            isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                
                if let error = error {
                    self?.error = error
                    return
                }
                
                guard let data = data else {
                    self?.error = URLError(.badServerResponse)
                    return
                }
                
                do {
                    let decoder = JSONDecoder()
                    let quotes = try decoder.decode([Quote].self, from: data)
                    self?.quote = quotes.first
                } catch {
                    self?.error = error
                }
            }
        }.resume()
    }
    
    func translateQuote(_ text: String, to lang: String) {
        let baseURL = "https://lingva.ml/api/v1"
        let encodedText = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "\(baseURL)/en/\(lang)/\(encodedText)"
        
        guard let url = URL(string: urlString) else { return }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                guard let data = data,
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let translation = json["translation"] as? String else {
                    return
                }
                
                self?.translatedQuote = translation
            }
        }.resume()
    }
} 