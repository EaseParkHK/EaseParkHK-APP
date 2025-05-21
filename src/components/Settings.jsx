import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, ListGroup, InputGroup, Row, Col } from 'react-bootstrap';

// 假設你有一份 carpark 資料清單
// 請根據實際情況將 carparkList 替換為你的來源
const carparkList = [
  // 範例資料
  { park_Id: 'CP001', name_en: 'Central Carpark', name_tc: '中環停車場', name_sc: '中环停车场' },
  { park_Id: 'CP002', name_en: 'Harbour Carpark', name_tc: '海港停車場', name_sc: '海港停车场' },
  // ...更多資料
];

function getCarparkName(id, lang) {
  const found = carparkList.find(c => c.park_Id === id);
  if (!found) return id;
  if (lang === 'tc') return found.name_tc;
  if (lang === 'sc') return found.name_sc;
  return found.name_en;
}

function Settings({ lang, onLangChange, darkMode, onThemeToggle }) {
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorite_carparks') || '[]'));
  const [groups, setGroups] = useState(() => JSON.parse(localStorage.getItem('carpark_groups') || '{}'));
  const [newGroup, setNewGroup] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [carparkId, setCarparkId] = useState('');

  // 同步 localStorage
  useEffect(() => {
    localStorage.setItem('favorite_carparks', JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem('carpark_groups', JSON.stringify(groups));
  }, [groups]);

  // 新增群組
  const handleAddGroup = () => {
    if (newGroup && !groups[newGroup]) {
      setGroups({ ...groups, [newGroup]: [] });
      setNewGroup('');
    }
  };

  // 刪除群組
  const handleDeleteGroup = group => {
    const newGroups = { ...groups };
    delete newGroups[group];
    setGroups(newGroups);
    if (selectedGroup === group) setSelectedGroup('');
  };

  // 加入收藏
  const handleAddFavorite = () => {
    if (carparkId && !favorites.includes(carparkId)) {
      setFavorites([...favorites, carparkId]);
    }
    setCarparkId('');
  };

  // 從收藏移除
  const handleRemoveFavorite = id => {
    setFavorites(favorites.filter(f => f !== id));
    // 同時從所有群組移除
    const newGroups = {};
    Object.keys(groups).forEach(g => {
      newGroups[g] = groups[g].filter(cid => cid !== id);
    });
    setGroups(newGroups);
  };

  // 加入群組
  const handleAddToGroup = id => {
    if (selectedGroup && groups[selectedGroup] && !groups[selectedGroup].includes(id)) {
      setGroups({
        ...groups,
        [selectedGroup]: [...groups[selectedGroup], id],
      });
    }
  };

  // 從群組移除
  const handleRemoveFromGroup = (group, id) => {
    setGroups({
      ...groups,
      [group]: groups[group].filter(cid => cid !== id),
    });
  };

  return (
    <Container className="my-5">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>
            {lang === 'en' ? 'Settings' : lang === 'tc' ? '設定' : '设置'}
          </Card.Title>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                {lang === 'en' ? 'Language' : lang === 'tc' ? '語言' : '语言'}
              </Form.Label>
              <Form.Select
                value={lang}
                onChange={e => onLangChange(e.target.value)}
              >
                <option value="en">English</option>
                <option value="tc">繁體中文</option>
                <option value="sc">简体中文</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                {lang === 'en' ? 'Theme' : lang === 'tc' ? '主題' : '主题'}
              </Form.Label>
              <div>
                <Button
                  variant={darkMode ? 'secondary' : 'outline-secondary'}
                  onClick={onThemeToggle}
                >
                  {darkMode
                    ? lang === 'en'
                      ? 'Dark Mode'
                      : lang === 'tc'
                      ? '深色模式'
                      : '深色模式'
                    : lang === 'en'
                    ? 'Light Mode'
                    : lang === 'tc'
                    ? '淺色模式'
                    : '浅色模式'}
                </Button>
              </div>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>

      {/* 收藏管理 */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>
            {lang === 'en' ? 'Manage Favourite Carparks' : lang === 'tc' ? '管理收藏車場' : '管理收藏车场'}
          </Card.Title>
          <InputGroup className="mb-3">
            <Form.Select
              value={carparkId}
              onChange={e => setCarparkId(e.target.value)}
            >
              <option value="">
                {lang === 'en' ? 'Select Carpark' : lang === 'tc' ? '選擇車場' : '选择车场'}
              </option>
              {carparkList.map(c => (
                <option key={c.park_Id} value={c.park_Id}>
                  {getCarparkName(c.park_Id, lang)}
                </option>
              ))}
            </Form.Select>
            <Button variant="primary" onClick={handleAddFavorite} disabled={!carparkId}>
              {lang === 'en' ? 'Add' : lang === 'tc' ? '加入' : '加入'}
            </Button>
          </InputGroup>
          <ListGroup>
            {favorites.length === 0 && (
              <ListGroup.Item>
                {lang === 'en' ? 'No favourites yet.' : lang === 'tc' ? '暫無收藏。' : '暂无收藏。'}
              </ListGroup.Item>
            )}
            {favorites.map(id => (
              <ListGroup.Item key={id}>
                <Row>
                  <Col xs={6}>{getCarparkName(id, lang)}</Col>
                  <Col xs={6} className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFavorite(id)}
                      className="me-2"
                    >
                      {lang === 'en' ? 'Remove' : lang === 'tc' ? '移除' : '移除'}
                    </Button>
                    <Form.Select
                      size="sm"
                      style={{ width: 'auto', display: 'inline-block' }}
                      value={selectedGroup}
                      onChange={e => setSelectedGroup(e.target.value)}
                    >
                      <option value="">
                        {lang === 'en' ? 'Select Group' : lang === 'tc' ? '選擇群組' : '选择群组'}
                      </option>
                      {Object.keys(groups).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Form.Select>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-2"
                      onClick={() => handleAddToGroup(id)}
                      disabled={!selectedGroup}
                    >
                      {lang === 'en' ? 'Add to Group' : lang === 'tc' ? '加入群組' : '加入群组'}
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* 群組管理 */}
      <Card>
        <Card.Body>
          <Card.Title>
            {lang === 'en' ? 'Carpark Groups' : lang === 'tc' ? '車場群組' : '车场群组'}
          </Card.Title>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder={lang === 'en' ? 'New Group Name' : lang === 'tc' ? '新群組名稱' : '新群组名称'}
              value={newGroup}
              onChange={e => setNewGroup(e.target.value)}
            />
            <Button variant="success" onClick={handleAddGroup}>
              {lang === 'en' ? 'Add Group' : lang === 'tc' ? '新增群組' : '新增群组'}
            </Button>
          </InputGroup>
          <ListGroup>
            {Object.keys(groups).length === 0 && (
              <ListGroup.Item>
                {lang === 'en' ? 'No groups yet.' : lang === 'tc' ? '暫無群組。' : '暂无群组。'}
              </ListGroup.Item>
            )}
            {Object.entries(groups).map(([g, ids]) => (
              <ListGroup.Item key={g}>
                <Row>
                  <Col xs={6}><b>{g}</b></Col>
                  <Col xs={6} className="text-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteGroup(g)}
                    >
                      {lang === 'en' ? 'Delete' : lang === 'tc' ? '刪除' : '删除'}
                    </Button>
                  </Col>
                </Row>
                <div className="mt-2">
                  {ids.length === 0
                    ? <span style={{ color: '#888' }}>
                        {lang === 'en' ? 'No carparks in this group.' : lang === 'tc' ? '此群組沒有車場。' : '此群组没有车场。'}
                      </span>
                    : ids.map(id => (
                        <span key={id} className="badge bg-secondary me-2">
                          {getCarparkName(id, lang)}
                          <Button
                            size="sm"
                            variant="link"
                            style={{ color: '#fff', textDecoration: 'none', marginLeft: 4, padding: 0 }}
                            onClick={() => handleRemoveFromGroup(g, id)}
                          >
                            ×
                          </Button>
                        </span>
                      ))}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Settings;