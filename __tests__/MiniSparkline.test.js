import React from 'react';
import renderer, { act } from 'react-test-renderer';
import MiniSparkline from '../src/components/MiniSparkline';

describe('MiniSparkline', () => {
  it('renders empty state correctly', () => {
    let tree;
    act(() => {
      tree = renderer.create(<MiniSparkline data={[]} />);
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders bars for numeric data', () => {
    const data = [1, 3, 2, 5, 4];
    let tree;
    act(() => {
      tree = renderer.create(<MiniSparkline data={data} />);
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
