import SwiftUI

struct LogoView: View {
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        Image(colorScheme == .dark ? "UTMBLogoDark" : "UTMBLogo")
            .resizable()
            .scaledToFit()
            .frame(width: 60, height: 60)
            .opacity(colorScheme == .dark ? 0.9 : 0.8)
    }
}

#Preview {
    Group {
        LogoView()
            .preferredColorScheme(.light)
        LogoView()
            .preferredColorScheme(.dark)
    }
} 