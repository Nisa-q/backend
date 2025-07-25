FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://github.com/projectdiscovery/katana/releases/download/v1.2.1/katana_1.2.1_linux_amd64.zip && \
    unzip katana_1.2.1_linux_amd64.zip && \
    mv katana /usr/local/bin/katana && \
    chmod +x /usr/local/bin/katana && \
    rm katana_1.2.1_linux_amd64.zip
COPY . .
EXPOSE 5000
CMD ["python", "app.py"] 