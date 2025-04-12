import SwiftUI

struct OnlineScheduleView: View {
    @StateObject private var service = OnlineScheduleService()
    @State private var selectedDay = 0
    @State private var selectedTypes: Set<EventType> = Set(EventType.allCases)
    let days = ["Quinta", "Sexta", "Sábado", "Domingo"]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Cabeçalho fixo
                VStack(spacing: 16) {
                    // Título e data
                    Text("Programação")
                        .font(.system(size: 32))
                        .fontWeight(.bold)
                    
                    Text("18 a 21 de setembro 2025")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                    
                    // Filtros de tipo
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(EventType.allCases, id: \.self) { type in
                                Button {
                                    toggleType(type)
                                } label: {
                                    HStack(spacing: 6) {
                                        Image(systemName: type.icon)
                                            .font(.system(size: 14))
                                        Text(type.rawValue)
                                            .font(.subheadline)
                                    }
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(
                                        Capsule()
                                            .fill(selectedTypes.contains(type) ? type.color.opacity(0.2) : Color.gray.opacity(0.1))
                                    )
                                    .foregroundColor(selectedTypes.contains(type) ? type.color : .gray)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Seletor de dias
                    Picker("Dia", selection: $selectedDay) {
                        ForEach(0..<days.count, id: \.self) { index in
                            Text(days[index]).tag(index)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                }
                .padding(.top, 16)
                .background(Color.white)
                
                // Conteúdo
                if service.isLoading {
                    Spacer()
                    VStack(spacing: 12) {
                        ProgressView()
                            .scaleEffect(1.2)
                        Text("Carregando programação...")
                            .foregroundColor(.gray)
                    }
                    Spacer()
                } else if let error = service.error {
                    Spacer()
                    ErrorView(error: error) {
                        service.fetchEvents()
                    }
                    Spacer()
                } else if service.events.isEmpty {
                    Spacer()
                    Text("Nenhum evento encontrado")
                        .foregroundColor(.gray)
                    Spacer()
                } else {
                    List(filteredEvents) { event in
                        OnlineEventRow(event: event)
                            .listRowInsets(EdgeInsets(
                                top: 0,
                                leading: 16,
                                bottom: 0,
                                trailing: 16
                            ))
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await refreshData()
                    }
                }
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    LogoView()
                }
            }
        }
        .onAppear {
            if service.events.isEmpty {
                service.fetchEvents()
            }
        }
    }
    
    private func toggleType(_ type: EventType) {
        if selectedTypes.contains(type) {
            if selectedTypes.count > 1 {
                selectedTypes.remove(type)
            }
        } else {
            selectedTypes.insert(type)
        }
    }
    
    private var filteredEvents: [Event] {
        service.events.filter { event in
            let calendar = Calendar.current
            let eventDay = calendar.component(.day, from: event.date) - 18
            return eventDay == selectedDay && selectedTypes.contains(event.type)
        }
    }
    
    private func refreshData() async {
        try? await Task.sleep(nanoseconds: 500_000_000)
        service.fetchEvents()
    }
}

struct ErrorView: View {
    let error: Error
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "wifi.slash")
                .font(.system(size: 50))
                .foregroundColor(.red)
            Text("Erro ao carregar programação")
                .font(.headline)
            Text(error.localizedDescription)
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            Button("Tentar novamente", action: retryAction)
                .buttonStyle(.bordered)
                .tint(byUTMBApp.utmbBlue)
        }
    }
} 
