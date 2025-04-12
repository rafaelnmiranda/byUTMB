import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            OnlineScheduleView()
                .tabItem {
                    Label("Programação", systemImage: "calendar")
                }
            
            InformationView()
                .tabItem {
                    Label("Informações", systemImage: "info.circle")
                }
            
            WeatherView()
                .tabItem {
                    Label("Previsão", systemImage: "cloud.sun")
                }
            
            AstronomyView()
                .tabItem {
                    Label("Astronomia", systemImage: "star.fill")
                }
            
            QuoteView()
                .tabItem {
                    Label("Mensagem", systemImage: "quote.bubble.fill")
                }
        }
    }
}

#Preview {
    MainTabView()
} 
