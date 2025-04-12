import Foundation

struct AstronomyPicture: Codable {
    let title: String
    let explanation: String
    let url: String
    let hdurl: String?
    let mediaType: String
    let date: String
    let copyright: String?
    
    enum CodingKeys: String, CodingKey {
        case title
        case explanation
        case url
        case hdurl
        case mediaType = "media_type"
        case date
        case copyright
    }
} 