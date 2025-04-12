import SwiftUI

struct QuoteView: View {
    @StateObject private var service = QuoteService()
    @State private var showingShareSheet = false
    @State private var isPortuguese = true
    @State private var translatedQuote: String?
    
    var body: some View {
        NavigationView {
            ZStack {
                // Gradiente de fundo
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color(red: 0.1, green: 0.2, blue: 0.45),
                        Color(red: 0.3, green: 0.4, blue: 0.6)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                Group {
                    if service.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else if let error = service.error {
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.system(size: 50))
                                .foregroundColor(.yellow)
                            Text("Erro ao carregar mensagem")
                                .font(.headline)
                                .foregroundColor(.white)
                            Button("Tentar novamente") {
                                service.fetchQuote()
                            }
                            .buttonStyle(.bordered)
                            .tint(.white)
                        }
                    } else if let quote = service.quote {
                        VStack(spacing: 30) {
                            // Botão de idioma
                            HStack {
                                Spacer()
                                Menu {
                                    Button(action: {
                                        isPortuguese = true
                                        if let quote = service.quote {
                                            service.translateQuote(quote.quote, to: "pt")
                                        }
                                    }) {
                                        Label("Português", systemImage: isPortuguese ? "checkmark" : "")
                                    }
                                    
                                    Button(action: {
                                        isPortuguese = false
                                        translatedQuote = nil
                                    }) {
                                        Label("English", systemImage: !isPortuguese ? "checkmark" : "")
                                    }
                                } label: {
                                    Image(systemName: "globe")
                                        .font(.title3)
                                        .foregroundColor(.white)
                                        .padding(8)
                                        .background(Color.white.opacity(0.2))
                                        .clipShape(Circle())
                                }
                            }
                            .padding(.top)
                            
                            Spacer()
                            
                            // Ícone decorativo
                            Image(systemName: "quote.bubble.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.white.opacity(0.3))
                            
                            // Citação
                            Text(isPortuguese ? (translatedQuote ?? quote.quote) : quote.quote)
                                .font(.system(.title2, design: .serif))
                                .fontWeight(.medium)
                                .multilineTextAlignment(.center)
                                .foregroundColor(.white)
                                .padding(.horizontal)
                                .animation(.easeInOut, value: isPortuguese)
                            
                            // Autor
                            Text("— \(quote.author)")
                                .font(.system(.body, design: .serif))
                                .foregroundColor(.white.opacity(0.8))
                                .padding(.top, 8)
                            
                            Spacer()
                            
                            // Botões
                            HStack(spacing: 20) {
                                Button {
                                    service.fetchQuote()
                                    translatedQuote = nil
                                } label: {
                                    Label("Nova mensagem", systemImage: "arrow.clockwise")
                                }
                                .buttonStyle(.bordered)
                                .tint(.white)
                                
                                Button {
                                    showingShareSheet = true
                                } label: {
                                    Label("Compartilhar", systemImage: "square.and.arrow.up")
                                }
                                .buttonStyle(.bordered)
                                .tint(.white)
                            }
                            .padding(.bottom, 30)
                        }
                        .sheet(isPresented: $showingShareSheet) {
                            let textToShare = "\"\(isPortuguese ? (translatedQuote ?? quote.quote) : quote.quote)\"\n— \(quote.author)"
                            ShareSheet(activityItems: [textToShare])
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Mensagem do Dia")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    LogoView()
                }
            }
        }
        .onAppear {
            service.fetchQuote()
        }
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]
    
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
} 