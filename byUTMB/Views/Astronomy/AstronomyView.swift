import SwiftUI

struct AstronomyView: View {
    @StateObject private var service = AstronomyService()
    @State private var isFullScreen = false
    
    var body: some View {
        NavigationView {
            Group {
                if service.isLoading {
                    ProgressView("Carregando imagem...")
                } else if let error = service.error {
                    VStack(spacing: 16) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)
                        Text("Erro ao carregar imagem")
                            .font(.headline)
                        Text(error.localizedDescription)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        Button("Tentar novamente") {
                            service.fetchPictureOfTheDay()
                        }
                        .buttonStyle(.bordered)
                        .tint(.blue)
                    }
                } else if let picture = service.picture {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            AsyncImage(url: URL(string: picture.hdurl ?? picture.url)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .cornerRadius(12)
                                    .onTapGesture {
                                        isFullScreen = true
                                    }
                            } placeholder: {
                                ProgressView()
                                    .frame(height: 300)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text(picture.title)
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                if let copyright = picture.copyright {
                                    Text("© \(copyright)")
                                        .font(.caption)
                                        .foregroundColor(.gray)
                                }
                                
                                Text(picture.date)
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                                
                                Text(picture.explanation)
                                    .font(.body)
                                    .padding(.top, 8)
                            }
                        }
                        .padding()
                    }
                    .fullScreenCover(isPresented: $isFullScreen) {
                        FullScreenImageView(imageURL: picture.hdurl ?? picture.url)
                    }
                }
            }
            .navigationTitle("Foto Astronômica")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    LogoView()
                }
            }
        }
        .onAppear {
            service.fetchPictureOfTheDay()
        }
    }
}

struct FullScreenImageView: View {
    let imageURL: String
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            AsyncImage(url: URL(string: imageURL)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            } placeholder: {
                ProgressView()
            }
            
            VStack {
                HStack {
                    Spacer()
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title)
                            .foregroundColor(.white)
                            .padding()
                    }
                }
                Spacer()
            }
        }
    }
} 