//
//  ContentView.swift
//  Aila
//
//  Created by Anesh Kondor on 11/15/25.
//

import SwiftUI
import RealityKit

struct ContentView: View {

    var body: some View {
        VStack {
            ToggleImmersiveSpaceButton()
        }simu
    }
}

#Preview(windowStyle: .automatic) {
    ContentView()
        .environment(AppModel())
}
