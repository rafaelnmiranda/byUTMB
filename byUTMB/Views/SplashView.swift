import SwiftUI

struct SplashView: View {
    @State private var isActive = false
    @State private var size = 0.6
    @State private var opacity = 0.3
    
    var body: some View {
        if isActive {
            MainTabView()
        } else {
            ZStack {
                byUTMBApp.utmbBlue
                    .ignoresSafeArea()
                
                VStack {
                    Image("UTMBLogo")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 200)
                        .scaleEffect(size)
                        .opacity(opacity)
                }
            }
            .onAppear {
                withAnimation(.easeOut(duration: 2.0)) {
                    self.size = 1.2
                    self.opacity = 1.0
                }
                DispatchQueue.main.asyncAfter(deadline: .now() + 4.0) {
                    withAnimation(.easeOut(duration: 0.5)) {
                        self.isActive = true
                    }
                }
            }
        }
    }
}

#Preview {
    SplashView()
}
