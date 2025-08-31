// 社員ID 0001と0002の打刻データの社員名を修正するスクリプト
// ブラウザのコンソールで実行してください

console.log('社員名修正スクリプトを実行中...');

// 既存の打刻データを取得
const savedRecords = localStorage.getItem('tick_timeRecords');
if (savedRecords) {
  try {
    const records = JSON.parse(savedRecords);
    console.log('修正前の打刻データ:', records);
    
    // 社員ID 0001と0002のデータを修正
    const updatedRecords = records.map(record => {
      if (record.employeeId === '0001' || record.employeeId === '0002') {
        return {
          ...record,
          employeeName: '田中太郎',
          department: '営業部'
        };
      }
      return record;
    });
    
    // 修正されたデータを保存
    localStorage.setItem('tick_timeRecords', JSON.stringify(updatedRecords));
    console.log('修正後の打刻データ:', updatedRecords);
    console.log('✅ 社員名の修正が完了しました！');
    
    // ページを再読み込みして変更を反映
    console.log('ページを再読み込みして変更を反映してください');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
} else {
  console.log('打刻データが見つかりません');
}

// 社員データも確認
const savedEmployees = localStorage.getItem('tick_app_data');
if (savedEmployees) {
  try {
    const appData = JSON.parse(savedEmployees);
    console.log('社員データ:', appData.employees || []);
  } catch (error) {
    console.error('社員データの読み込みエラー:', error);
  }
}

// 強制的にlocalStorageをクリアして新しいデータを作成
console.log('強制リセットを実行しますか？');
console.log('以下のコマンドを実行してください:');
console.log('localStorage.removeItem("tick_timeRecords");');
console.log('location.reload();');
