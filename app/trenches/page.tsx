import { TrenchesPage } from "@/components/trenches-page"
import { TrenchesBackground } from "@/components/trenches-background"
import { BackgroundCustomizer } from "@/components/background-customizer"

export default function Trenches() {
  return (
    <TrenchesBackground>
      <TrenchesPage />
      <BackgroundCustomizer />
    </TrenchesBackground>
  )
}
