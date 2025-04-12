import SwiftUI

struct OnlineEventDetailView: View {
    let event: Event
    @Environment(\.dismiss) var dismiss
    
    var endTime: Date {
        event.date.addingTimeInterval(event.duration)
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Imagem do evento
                if let imageName = event.imageName {
                    Image(imageName)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(maxWidth: .infinity)
                        .frame(height: 200)
                        .clipped()
                }
                
                VStack(alignment: .leading, spacing: 16) {
                    // Título e tipo
                    HStack {
                        Text(event.title)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Spacer()
                        
                        Image(systemName: event.type.icon)
                            .foregroundColor(event.type.color)
                    }
                    
                    // Data e horários
                    HStack {
                        Image(systemName: "clock")
                            .foregroundColor(.gray)
                        Text("\(event.date.formatted(date: .abbreviated, time: .shortened)) – \(endTime.formatted(date: .omitted, time: .shortened))")
                            .foregroundColor(.gray)
                    }
                    
                    // Local
                    HStack {
                        Image(systemName: "mappin.circle")
                            .foregroundColor(.gray)
                        Text(event.location)
                            .foregroundColor(.gray)
                    }
                    
                    Divider()
                    
                    // Descrição
                    Text("Sobre")
                        .font(.headline)
                    Text(event.description)
                        .foregroundColor(.secondary)
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.gray)
                }
            }
        }
    }
} 