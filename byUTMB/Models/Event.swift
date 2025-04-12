import SwiftUI

struct Event: Identifiable {
    let id: UUID
    let title: String
    let description: String
    let date: Date
    let location: String
    let duration: TimeInterval
    let type: EventType
    let imageName: String?
}

enum EventType: String, CaseIterable {
    case esporte = "Esporte"
    case entretenimento = "Entretenimento"
    case ativacao = "Ativação"
    
    var icon: String {
        switch self {
        case .esporte:
            return "figure.run"
        case .entretenimento:
            return "music.note"
        case .ativacao:
            return "star.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .esporte:
            return .blue
        case .entretenimento:
            return .orange
        case .ativacao:
            return .green
        }
    }
} 