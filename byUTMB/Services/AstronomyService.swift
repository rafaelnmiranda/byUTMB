import Foundation

class AstronomyService: ObservableObject {
    @Published var picture: AstronomyPicture?
    @Published var isLoading = false
    @Published var error: Error?
    
    // Substitua pela sua chave da API
    private let apiKey = "zrkQQ3uIz7pX2ia3dS4sRSEmDaskndy8MsLTcDGU"
    
    func fetchPictureOfTheDay() {
        isLoading = true
        error = nil
        
        let urlString = "https://api.nasa.gov/planetary/apod?api_key=\(apiKey)"
        
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
                    let picture = try decoder.decode(AstronomyPicture.self, from: data)
                    self?.picture = picture
                } catch {
                    self?.error = error
                }
            }
        }.resume()
    }
} 
