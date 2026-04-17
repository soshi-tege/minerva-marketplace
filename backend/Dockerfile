# initialize the image with Python 3.11
FROM python:3.11-slim

# set the working directory
WORKDIR /app/backend
ENV PYTHONPATH=/app

# copy requirements in the home directory
COPY requirements.txt ./

# run pip install
RUN pip install -r requirements.txt

# copy all the files in the directory
COPY . .

# run the application after the image is built
ENTRYPOINT ["python"]
CMD ["app.py"]
