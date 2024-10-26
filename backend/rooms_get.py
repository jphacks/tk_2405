import datetime
import json
import logging
import os
import random
import sys
import site

import boto3
import psycopg2


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def connect_db():
    conn = psycopg2.connect(
        host=os.environ["db_host"],
        dbname=os.environ["db_name"],
        port=os.environ["db_port"],
        user=os.environ["db_user"],
        password=os.environ["db_pass"]
    )
    logger.info("SUCCESS: Connection to RDS Aurora instance succeeded")
    return conn


def lambda_handler(event, context):
    status_code = 200
    query_param = event.get("queryStringParameters", {}) if event.get("queryStringParameters", {}) else {}
    path_param = event.get("pathParameters", {}) if event.get("pathParameters", {}) else {}
    body = json.loads(event.get("body", "{}") if event.get("body", "{}") else "{}")
    if not ( all(key in body for key in ("strength", "duration")) and all(key in query_param for key in ("user_id",)) and all(key in path_param for key in ("room_id",))):
        status_code = 400
        response_body = {
            "message": "Bad Request"
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    conn = connect_db()
    cur = conn.cursor()
    room_id = int(path_param["room_id"].replace("r", ""))
    cur.execute(f"SELECT room_id FROM rooms WHERE room_id = {room_id};")
    if not cur.fetchone():
        status_code = 404
        response_body = {
            "message": "No such room exists."
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    cur.execute(f"SELECT user_id FROM room_participants WHERE room_id = {room_id} AND user_id = '{query_param["user_id"]}';")
    if not cur.fetchone():
        status_code = 403
        response_body = {
            "message": f"User '{query_param["user_id"]}' is not joined to room '{path_param["room_id"]}'."
        }
        return {"statusCode": status_code, "body": json.dumps(response_body)}
    sql_query = f"""SELECT 
        r.room_id,
        r.training_duration,
        r.training_strength,
        r.created_at,
        COUNT(rp.participant_id) AS participant_count,
        r.training_duration - (EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 60) AS remain_time
    FROM 
        rooms r
    LEFT JOIN 
        room_participants rp ON r.room_id = rp.room_id
    WHERE
        r.room_id = {room_id}
    GROUP BY 
        r.room_id, r.training_duration, r.training_strength, r.created_at;
    """
    cur.execute(sql_query)
    result = cur.fetchone()
    room_status_json = {
        "room_id": f"r{room_id}",
        "training_duration": result[1],
        "training_strength": result[2],
        "created_at": result[3],
        "remain_lifetime": result[5]
    }
    sql_query = f"""SELECT 
        rp.user_id,
        u.user_name,
        rp.joined_at, 
        u.current_status
    FROM 
        room_participants rp 
    LEFT JOIN 
        users u ON rp.user_id = u.user_id
    WHERE
        rp.room_id = {room_id};
    """
    cur.execute(sql_query)
    result = cur.fetchall()
    participants = [{
        "user_id": r[0],
        "user_name": r[1],
        "joined_at": r[2],
        "current_status": r[3]
        } for r in result]
    room_status_json["participants"] = participants
    posts = [
        {
            "post_at": "2024-10-25 20:54:32+0900",
            "author": "yyyyyyy",
            "contents": "太郎は腹筋10回を終わらせた！🎉"
        },
        {
            "post_at": "2024-10-25 20:55:15+0900",
            "author": "zzzzzzz",
            "contents": "はらみの休憩終了！🔥"
        }
    ]
    room_status_json["posts"] = posts
    response_body = room_status_json
    return {"statusCode": status_code, "body": json.dumps(response_body)}