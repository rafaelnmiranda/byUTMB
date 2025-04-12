import SwiftUI

struct OnlineEventRow: View {
    let event: Event
    
    var endTime: Date {
        event.date.addingTimeInterval(event.duration)
    }
    
    var backgroundColor: Color {
        event.type.color.opacity(0.1)
    }
    
    var body: some View {
        NavigationLink(destination: OnlineEventDetailView(event: event)) {
            HStack(spacing: 12) {
                // Conteúdo principal
                VStack(alignment: .leading, spacing: 4) {
                    // Horário e título
                    HStack {
                        Text("\(event.date.formatted(date: .omitted, time: .shortened)) – \(endTime.formatted(date: .omitted, time: .shortened))")
                            .foregroundColor(.gray)
                        Text(event.title)
                            .foregroundColor(.primary)
                    }
                    
                    // Local (mais discreto)
                    Text("Local: \(event.location)")
                        .font(.caption)
                        .foregroundColor(.gray.opacity(0.8))
                }
                
                Spacer()
                
                // Ícone do tipo (centralizado verticalmente)
                Image(systemName: event.type.icon)
                    .foregroundColor(event.type.color)
                    .font(.system(size: 16))
            }
            .padding(.vertical, 12)
            .padding(.horizontal, 8)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(backgroundColor)
            )
            .padding(.horizontal, 4)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    OnlineEventRow(event: Event(
        id: UUID(),
        title: "UTMB EXPO",
        description: "Exposição de produtos",
        date: Date(),
        location: "EXPO",
        duration: 3600,
        type: .entretenimento,
        imageName: "expo_main"
    ))
    .padding()
} 