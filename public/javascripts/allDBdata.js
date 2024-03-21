// MongoDB 드라이버를 로드합니다.
const { MongoClient } = require('mongodb');


// MongoDB 서버 URL
const url = 'mongodb://localhost:27017';

// 데이터베이스 이름
const dbName = 'yelp-camp';

// 클라이언트를 생성합니다.
const client = new MongoClient(url);

// 데이터를 가져오는 함수
async function getCampgrounds() {
    try {
        // MongoDB에 연결합니다.
        await client.connect();
        console.log('Connected to the MongoDB server');

        // 데이터베이스를 가져옵니다.
        const db = client.db(dbName);

        // campgrounds 컬렉션을 가져옵니다.
        const collection = db.collection('campgrounds');

        // campgrounds 컬렉션에서 데이터를 찾습니다.
        const campgrounds = await collection.find({}).toArray();

        // 결과 출력
        console.log('Campgrounds:', campgrounds);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // 클라이언트를 닫습니다.
        await client.close();
        console.log('Disconnected from the MongoDB server');

    }
}

// 함수 호출
module.exports = getCampgrounds;
