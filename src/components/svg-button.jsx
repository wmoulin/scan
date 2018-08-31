import React from 'react';

export class SvgButton extends React.Component {
    render () {
        return (
            <a href="#" onClick={this.props.handleClick} title={this.props.title}>
            <svg width="100" class={this.props.svgClass} preserveAspectRatio="xMidYMid meet">
                <use xlinkHref={"./static/images/sprite-scan.svg#" + this.props.id}/>
            </svg>
            </a>
        )
    }
}
