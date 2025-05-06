# Plant Disease Classification

This application classifies plant leaf images to detect diseases.

## Troubleshooting Prediction Issues

If you're experiencing incorrect predictions with the model, here are some steps to diagnose and fix the problems:

### 1. Check the model loading

The model appears to be loading correctly as we're seeing proper prediction values in the output. The raw output values for an example prediction are:
```
Raw output values: tensor([ 1.4548, 6.7704, -6.2777, 10.9793, 7.6160])
```

These are reasonable logit values that have been properly learned, not random values.

### 2. Run tests with known images

Use the provided test script to verify predictions on known images:

```bash
# Test a single image
python test_model.py --image path/to/your/image.jpg --expected "Apple"

# Test a folder of images
python test_model.py --folder path/to/image/folder
```

### 3. Check what classes your model supports

The model is trained to recognize these plant diseases:
- Apple (healthy and various diseases)
- Blueberry
- Cherry
- Corn/Maize
- Grape
- Orange
- Peach
- Pepper
- Potato
- Raspberry
- Soybean
- Squash
- Strawberry
- Tomato (healthy and various diseases)

If you're testing with plants that aren't in these categories, the model will make incorrect predictions.

### 4. Verify image preprocessing

The preprocessing pipeline:
- Resizes images to 224×224 pixels
- Normalizes using ImageNet mean/std values: [0.485, 0.456, 0.406] / [0.229, 0.224, 0.225]

If your training used different normalization values, update the preprocessing in app.py.

### 5. Check for domain shift

If your test images are significantly different from the training data (different lighting, backgrounds, camera quality), this can affect prediction accuracy.

### 6. Try using random cropping or data augmentation

If your images match the expected classes but predictions are still wrong, you might need additional preprocessing like:
- Random cropping
- Color augmentation
- Brightness/contrast adjustments

## Updating the Model

If needed, you can retrain the model with your specific dataset by:

1. Using the notebook to train with your own data
2. Saving the model with `torch.save(model.state_dict(), "model.pt")`
3. Replacing the existing model.pt file

## Debugging Information

The Gradio interface now includes detailed prediction information to help diagnose issues. This shows:
- Top 5 predictions with confidence scores
- Input image details
- Available class information 