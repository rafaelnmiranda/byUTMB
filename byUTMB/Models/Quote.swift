import Foundation

struct Quote: Codable {
    let q: String // quote
    let a: String // author
    let h: String // html
    
    var quote: String {
        return q.replacingOccurrences(of: "\\n", with: "\n")
    }
    
    var author: String {
        return a
    }
} 