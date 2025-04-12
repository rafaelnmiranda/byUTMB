import Foundation

let events: [Event] = [
    Event(
        id: UUID(),
        title: "UTMB EXPO",
        description: "Exposição aberta para o público e atletas explorarem as novidades e produtos das marcas parceiras.",
        date: createDate(day: 18, hour: 10, minute: 0),
        location: "EXPO",
        duration: 39600,
        type: .entretenimento,
        imageName: "expo_main"
    ),
    // ... outros eventos
]

private func createDate(day: Int, hour: Int, minute: Int) -> Date {
    var components = DateComponents()
    components.year = 2025
    components.month = 9
    components.day = day
    components.hour = hour
    components.minute = minute
    components.timeZone = TimeZone(identifier: "America/Sao_Paulo")
    
    return Calendar.current.date(from: components) ?? Date()
} 
