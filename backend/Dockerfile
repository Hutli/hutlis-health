FROM python:3.10

COPY ./run.sh /app/
COPY ./main.py /app/
COPY ./requirements.txt /app/
COPY ./log_conf.json /app/
COPY ./static /app/

WORKDIR /app/
RUN pip install -r requirements.txt

CMD ./run.sh