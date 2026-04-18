from app.utils.audio_extractor import analyze_audio_yamnet


class YAMNetAudioAnalyzer:
	def analyze(self, audio_path: str) -> dict:
		return analyze_audio_yamnet(audio_path)

