# LSTM Deepfake Detector
try:
	from tensorflow.keras.layers import LSTM, BatchNormalization, Dense, Dropout
	from tensorflow.keras.models import Sequential, load_model
except ImportError:  # pragma: no cover
	LSTM = None
	BatchNormalization = None
	Dense = None
	Dropout = None
	Sequential = None
	load_model = None


class LSTMDeepfakeDetector:
	def __init__(self, sequence_length=20, feature_dim=2048):
		self.sequence_length = sequence_length
		self.feature_dim = feature_dim
		self.model = None

	def build(self):
		if Sequential is None:
			raise RuntimeError("TensorFlow/Keras is unavailable")

		model = Sequential(
			[
				LSTM(256, return_sequences=True, input_shape=(self.sequence_length, self.feature_dim)),
				Dropout(0.3),
				BatchNormalization(),
				LSTM(128, return_sequences=False),
				Dropout(0.3),
				Dense(64, activation="relu"),
				Dropout(0.2),
				Dense(1, activation="sigmoid"),
			]
		)
		model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
		self.model = model
		return model

	def load(self, path):
		if load_model is None:
			raise RuntimeError("TensorFlow/Keras is unavailable")
		self.model = load_model(path)

	def predict(self, sequence):
		if self.model is None:
			raise RuntimeError("LSTM model is not loaded")
		return float(self.model.predict(sequence, verbose=0)[0][0])

	def save(self, path):
		if self.model is None:
			raise RuntimeError("LSTM model is not loaded")
		self.model.save(path)

