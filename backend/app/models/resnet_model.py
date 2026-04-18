# ResNet50 Feature Extractor
import logging

try:
	import tensorflow as tf
	from tensorflow.keras.applications import ResNet50
	from tensorflow.keras.models import Model
except ImportError:  # pragma: no cover
	tf = None
	ResNet50 = None
	Model = None


logger = logging.getLogger(__name__)


class ResNetFeatureExtractor:
	def __init__(self):
		self.model = None

	def load(self):
		if ResNet50 is None or Model is None:
			raise RuntimeError("TensorFlow/Keras is unavailable")

		base = ResNet50(
			weights="imagenet",
			include_top=False,
			pooling="avg",
			input_shape=(224, 224, 3),
		)
		self.model = Model(inputs=base.input, outputs=base.output)
		self.model.trainable = False
		logger.info("ResNet50 feature extractor loaded.")

	def extract(self, frames_batch, batch_size: int = 4):
		if self.model is None:
			raise RuntimeError("ResNet model is not loaded")
		if tf is None:
			raise RuntimeError("TensorFlow is unavailable")

		preprocessed = tf.keras.applications.resnet50.preprocess_input(frames_batch * 255.0)
		return self.model.predict(preprocessed, verbose=0, batch_size=max(1, min(8, batch_size)))

