import shutil

# Copy a file from one path to another
source_path = '/content/sample.txt'
destination_path = '/content/copy_sample.txt'

shutil.copy(source_path, destination_path)

print("File copied!")
