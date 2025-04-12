import SwiftUI

struct InformationView: View {
    @State private var isExpanded = false
    let aboutText = "Paraty Brazil by UTMB é um evento de trail running na histórica cidade de Paraty, parte da prestigiada UTMB World Series. Oferece percursos desafiadores por paisagens deslumbrantes como Mata Atlântica, montanhas e praias. O evento celebra o espírito de aventura e a conexão com a natureza, atraindo corredores de todo o mundo em busca do extraordinário."
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Próximo Evento
                    InfoSection(title: "PRÓXIMO EVENTO") {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("18 a 21 de setembro 2025")
                                .font(.body)
                            Text("3ª edição")
                                .font(.body)
                        }
                    }
                    
                    // Sobre o Evento
                    InfoSection(title: "SOBRE O EVENTO") {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(aboutText)
                                .font(.body)
                                .foregroundColor(.black)
                                .lineLimit(isExpanded ? nil : 2)
                            
                            Button(action: {
                                withAnimation {
                                    isExpanded.toggle()
                                }
                            }) {
                                Text(isExpanded ? "Ler menos" : "Ler mais")
                                    .font(.caption)
                                    .foregroundColor(.blue)
                                    .padding(.top, 4)
                            }
                        }
                    }
                    
                    // Local
                    InfoSection(title: "LOCAL") {
                        Link(destination: URL(string: "https://maps.app.goo.gl/RdbXdpNZiR5uEGn17")!) {
                            HStack(spacing: 8) {
                                Image(systemName: "mappin.and.ellipse")
                                    .foregroundColor(.gray)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Paraty - RJ")
                                        .font(.body)
                                        .foregroundColor(.blue)
                                    Text("Abrir no Google Maps")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                            }
                        }
                    }
                    
                    // Site Oficial
                    InfoSection(title: "SITE OFICIAL") {
                        Link(destination: URL(string: "https://paraty.utmb.world/pt")!) {
                            HStack(spacing: 8) {
                                Image(systemName: "globe")
                                    .foregroundColor(.gray)
                                Text("paraty.utmb.world")
                                    .font(.body)
                                    .foregroundColor(.blue)
                            }
                        }
                    }
                    
                    // Contato
                    InfoSection(title: "CONTATO") {
                        VStack(alignment: .leading, spacing: 12) {
                            // Email
                            Link(destination: URL(string: "mailto:paraty@service.utmb.world?subject=Contato%20do%20app")!) {
                                HStack(spacing: 8) {
                                    Image(systemName: "envelope.fill")
                                        .foregroundColor(.gray)
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("Email:")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                        Text("paraty@service.utmb.world")
                                            .font(.body)
                                            .foregroundColor(.blue)
                                    }
                                }
                            }
                            
                            // WhatsApp
                            Link(destination: URL(string: "https://wa.me/5511916984686")!) {
                                HStack(spacing: 8) {
                                    Image(systemName: "message.fill")
                                        .foregroundColor(.gray)
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("WhatsApp:")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                        Text("+55 11 91698-4686")
                                            .font(.body)
                                            .foregroundColor(.blue)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Informações")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    LogoView()
                }
            }
        }
    }
}

// Componente para seções de informação
struct InfoSection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
            
            content
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.white)
        .cornerRadius(8)
    }
}

#Preview {
    InformationView()
} 